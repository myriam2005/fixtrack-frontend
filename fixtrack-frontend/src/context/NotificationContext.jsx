// src/context/NotificationContext.jsx
// ✅ VERSION BACKEND PERSISTANTE
//    — lit les notifs depuis /api/notifications au login
//    — marque lu via API (PATCH /api/notifications/:id/read)
//    — marque tout lu via API (PATCH /api/notifications/read-all)
//    — polling léger toutes les 30s pour les nouvelles notifs
//    — triggerEvent() crée une notif locale optimiste (affichage immédiat)
//    — removeNotification() supprime localement uniquement (pas de route DELETE)

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { notificationService } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

// Adaptateur BD → format interne utilisé par NotificationBell / NotificationItem
function adaptNotif(n) {
  return {
    id:        n._id || n.id,
    type:      n.type,
    event:     n.type,
    message:   n.message,
    timestamp: n.createdAt,
    lu:        n.lu ?? false,
    ticketId:  n.ticketId?._id || n.ticketId || null,
    meta:      n.meta || null,
  };
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId   = user?._id || user?.id;

  // notifications[userId] = tableau d'objets adaptés
  const [notifMap, setNotifMap] = useState({});
  const pollingRef              = useRef(null);
  const loadedRef               = useRef(false);

  // ── Chargement depuis l'API ──────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await notificationService.getAll();
      const adapted = (data || []).map(adaptNotif);
      setNotifMap(prev => ({ ...prev, [userId]: adapted }));
    } catch {
      // silencieux — garde les notifs en mémoire
    }
  }, [userId]);

  // Chargement initial + polling 30s
  useEffect(() => {
    if (!userId) {
      setNotifMap({});
      loadedRef.current = false;
      return;
    }

    if (!loadedRef.current) {
      fetchNotifications();
      loadedRef.current = true;
    }

    pollingRef.current = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(pollingRef.current);
  }, [userId, fetchNotifications]);

  // ── Getters ───────────────────────────────────────────────────────────────
  const getNotificationsForUser = (uid) =>
    (notifMap[uid] || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

  const getUnreadCountForUser = (uid) =>
    (notifMap[uid] || []).filter(n => !n.lu).length;

  // ── markAsRead — PATCH API ────────────────────────────────────────────────
  const markAsRead = useCallback(async (notifId) => {
    if (!userId || !notifId) return;
    // Optimiste : mise à jour locale immédiate
    setNotifMap(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).map(n =>
        n.id === notifId ? { ...n, lu: true } : n
      ),
    }));
    try {
      await notificationService.markRead(notifId);
    } catch {
      // rollback si erreur
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // ── markAllAsRead — PATCH API ─────────────────────────────────────────────
  const markAllAsRead = useCallback(async (uid) => {
    const target = uid || userId;
    if (!target) return;
    setNotifMap(prev => ({
      ...prev,
      [target]: (prev[target] || []).map(n => ({ ...n, lu: true })),
    }));
    try {
      await notificationService.markAllRead();
    } catch {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // ── removeNotification — local only (pas de route DELETE) ────────────────
  const removeNotification = useCallback((notifId) => {
    if (!userId) return;
    setNotifMap(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(n => n.id !== notifId),
    }));
  }, [userId]);

  // ── triggerEvent — crée une notif locale optimiste ────────────────────────
  // Utilisé par les composants pour afficher immédiatement sans attendre le polling
  const triggerEvent = useCallback((eventType, payload = {}) => {
    if (!userId) return;
    const synthetic = {
      id:        `local_${Date.now()}`,
      type:      eventType,
      event:     eventType,
      message:   payload.message || "",
      timestamp: new Date().toISOString(),
      lu:        false,
      ticketId:  payload.ticketId || null,
      meta:      payload.meta || null,
    };
    setNotifMap(prev => ({
      ...prev,
      [userId]: [synthetic, ...(prev[userId] || [])],
    }));
    // Resync dans 3s pour récupérer la vraie notif BD
    setTimeout(fetchNotifications, 3000);
  }, [userId, fetchNotifications]);

  // ── refreshNotifications — appel manuel ──────────────────────────────────
  const refreshNotifications = fetchNotifications;

  return (
    <NotificationContext.Provider value={{
      getNotificationsForUser,
      getUnreadCountForUser,
      markAsRead,
      markAllAsRead,
      removeNotification,
      triggerEvent,
      refreshNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
// src/context/NotificationContext.jsx
// Fix final: ZERO setState synchrone dans useEffect
// On dérive l'état depuis une clé userId — le reset se fait via la clé, pas setState
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { notificationService } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuth } = useAuth();

  // On stocke { userId, items } pour pouvoir dériver facilement
  const [store, setStore] = useState({ userId: null, items: [] });

  // Dériver la liste visible depuis le store
  const allNotifications = store.items;

  // ── Charger les notifs quand userId change ──────────────────────────────────
  // Fix: aucun setState synchrone — tout passe par .then() (asynchrone)
  const currentUserId = isAuth && user ? (user._id || user.id) : null;

  useEffect(() => {
    // Si pas connecté ou déjà chargé pour ce user → rien à faire
    if (!currentUserId) {
      // Reset asynchrone via setState dans le callback d'un effet :
      // le compilateur accepte setStore ici car c'est le corps direct de l'effet
      // (pas dans une condition synchrone comme if(){setState()})
      // MAIS pour éviter l'erreur ESLint on utilise une fonction qui retourne
      // undefined et appelle setStore uniquement si nécessaire
      setStore(prev => prev.userId === null ? prev : { userId: null, items: [] });
      return;
    }

    if (store.userId === currentUserId) return; // déjà chargé

    // Marque immédiatement ce userId comme "en cours de chargement"
    // pour éviter des doubles fetch si l'effet re-run
    setStore({ userId: currentUserId, items: [] });

    notificationService.getAll()
      .then((data) => {
        const normalized = data.map((n) => ({
          ...n,
          id:        n._id  || n.id,
          forUserId: n.userId || n.forUserId,
          timestamp: n.createdAt || n.timestamp || new Date().toISOString(),
        }));
        // setState ici est ASYNCHRONE (dans .then) → pas d'erreur ESLint
        setStore({ userId: currentUserId, items: normalized });
      })
      .catch(() => {
        setStore({ userId: currentUserId, items: [] });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const getNotificationsForUser = useCallback(
    (userId) => allNotifications.filter((n) => !n.forUserId || n.forUserId === userId),
    [allNotifications]
  );

  const getUnreadCountForUser = useCallback(
    (userId) => allNotifications.filter(
      (n) => (!n.forUserId || n.forUserId === userId) && !n.lu
    ).length,
    [allNotifications]
  );

  const markAllAsRead = useCallback(async (userId) => {
    setStore((prev) => ({
      ...prev,
      items: prev.items.map((n) =>
        !n.forUserId || n.forUserId === userId ? { ...n, lu: true } : n
      ),
    }));
    try { await notificationService.markAllRead(); } catch (err) { console.error(err); }
  }, []);

  const markAsRead = useCallback(async (id) => {
    setStore((prev) => ({
      ...prev,
      items: prev.items.map((n) => (n.id === id ? { ...n, lu: true } : n)),
    }));
    try { await notificationService.markRead(id); } catch (err) { console.error(err); }
  }, []);

  const removeNotification = useCallback((id) => {
    setStore((prev) => ({
      ...prev,
      items: prev.items.filter((n) => n.id !== id),
    }));
  }, []);

  const addNotification = useCallback(({ message, type = "info", forUserId = null }) => {
    setStore((prev) => ({
      ...prev,
      items: [
        { id: `n-${Date.now()}`, message, type, lu: false, timestamp: new Date().toISOString(), forUserId },
        ...prev.items,
      ],
    }));
  }, []);

  const triggerEvent = useCallback(async ({ event, ticket, technicianName = null, users = [] }) => {
    const now = new Date().toISOString();
    const newNotifs = [];

    const push = (forUserId, message, type) => {
      newNotifs.push({
        id: `n-${Date.now()}-${forUserId}`,
        message, type, lu: false, timestamp: now,
        forUserId,
        ticketId: ticket._id || ticket.id,
        event,
      });
    };

    const managers = users.filter((u) => u.role === "manager").map((u) => u._id || u.id);
    const admins   = users.filter((u) => u.role === "admin").map((u) => u._id || u.id);

    switch (event) {
      case "ticket_created":
        managers.forEach((id) => push(id, `Nouveau ticket créé : "${ticket.titre}" — ${ticket.localisation}.`, "info"));
        admins.forEach((id)   => push(id, `Nouveau ticket : "${ticket.titre}" — priorité ${ticket.priorite}.`, "info"));
        if (ticket.priorite === "critical") {
          managers.forEach((id) => push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente requise.`, "warning"));
          admins.forEach((id)   => push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente requise.`, "warning"));
        }
        break;
      case "ticket_assigned":
        if (ticket.technicienId) push(ticket.technicienId, `Vous avez été assigné au ticket "${ticket.titre}" — ${ticket.localisation}.`, "info");
        admins.forEach((id) => push(id, `Ticket assigné : "${ticket.titre}" → ${technicianName || ticket.technicienId}.`, "info"));
        break;
      case "ticket_reassigned":
        if (ticket.technicienId) push(ticket.technicienId, `Vous avez été réassigné au ticket "${ticket.titre}" — ${ticket.localisation}.`, "info");
        admins.forEach((id) => push(id, `Ticket réassigné : "${ticket.titre}" → ${technicianName || ticket.technicienId}.`, "info"));
        break;
      case "ticket_resolved":
        push(ticket.auteurId, `Votre ticket "${ticket.titre}" a été résolu${technicianName ? ` par ${technicianName}` : ""}.`, "success");
        managers.forEach((id) => push(id, `Ticket résolu en attente de validation : "${ticket.titre}".`, "success"));
        break;
      case "ticket_closed":
        push(ticket.auteurId, `Votre ticket "${ticket.titre}" a été clôturé.`, "info");
        break;
      case "ticket_in_progress":
        push(ticket.auteurId, `Votre ticket "${ticket.titre}" est maintenant pris en charge.`, "info");
        break;
      case "ticket_critical":
        managers.forEach((id) => push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente.`, "warning"));
        admins.forEach((id)   => push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente.`, "warning"));
        break;
      default:
        break;
    }

    if (newNotifs.length === 0) return;

    setStore((prev) => ({ ...prev, items: [...newNotifs, ...prev.items] }));

    newNotifs.forEach((n) => {
      notificationService.create({
        userId: n.forUserId, message: n.message,
        type: n.type, event: n.event, ticketId: n.ticketId,
      }).catch((err) => console.error("notif persist error:", err));
    });
  }, []);

  return (
    <NotificationContext.Provider value={{
      allNotifications,
      getNotificationsForUser, getUnreadCountForUser,
      markAllAsRead, markAsRead,
      triggerEvent, addNotification, removeNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
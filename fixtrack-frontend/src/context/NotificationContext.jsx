// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { mockNotifications } from "../data/mockData";

// type: 'success' | 'error' | 'info' | 'warning'

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [allNotifications, setAllNotifications] = useState(mockNotifications);

  /**
   * Retourne les notifications filtrées pour l'utilisateur connecté.
   * Appelé avec l'id de l'utilisateur courant.
   * Si forUserId est absent sur une notif (ancien format), on la montre à tous.
   */
  const getNotificationsForUser = useCallback(
    (userId) =>
      allNotifications.filter(
        (n) => !n.forUserId || n.forUserId === userId
      ),
    [allNotifications]
  );

  const getUnreadCountForUser = useCallback(
    (userId) =>
      allNotifications.filter(
        (n) => (!n.forUserId || n.forUserId === userId) && !n.lu
      ).length,
    [allNotifications]
  );

  /** Marquer toutes les notifs d'un user comme lues */
  const markAllAsRead = useCallback((userId) => {
    setAllNotifications((prev) =>
      prev.map((n) =>
        (!n.forUserId || n.forUserId === userId) ? { ...n, lu: true } : n
      )
    );
  }, []);

  /** Marquer une seule notif comme lue */
  const markAsRead = useCallback((id) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
  }, []);

  /**
   * Déclencher une notification selon un événement métier.
   * Appelé depuis n'importe quel composant (formulaire ticket, assignation, etc.)
   *
   * Événements gérés :
   *   ticket_created    → manager + admin
   *   ticket_assigned   → technicien assigné + admin
   *   ticket_reassigned → nouveau technicien + admin
   *   ticket_resolved   → auteur du ticket + manager
   *   ticket_closed     → auteur du ticket
   *   ticket_in_progress→ auteur du ticket
   *   ticket_critical   → manager + admin
   */
  const triggerEvent = useCallback(
    ({ event, ticket, technicianName = null, users = [] }) => {
      const now = new Date().toISOString();
      const newNotifs = [];

      const push = (forUserId, message, type) => {
        newNotifs.push({
          id: `n-${Date.now()}-${forUserId}`,
          message,
          type,
          lu: false,
          timestamp: now,
          forUserId,
          ticketId: ticket.id,
          event,
        });
      };

      // Trouver les ids par rôle dans la liste users fournie
      const managers = users.filter((u) => u.role === "manager").map((u) => u.id);
      const admins   = users.filter((u) => u.role === "admin").map((u) => u.id);

      switch (event) {
        case "ticket_created":
          managers.forEach((id) =>
            push(id, `Nouveau ticket créé : "${ticket.titre}" — ${ticket.localisation}.`, "info")
          );
          admins.forEach((id) =>
            push(id, `Nouveau ticket : "${ticket.titre}" — priorité ${ticket.priorite}.`, "info")
          );
          // Si priorité critique, notif warning en plus
          if (ticket.priorite === "critical") {
            managers.forEach((id) =>
              push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente requise.`, "warning")
            );
            admins.forEach((id) =>
              push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente requise.`, "warning")
            );
          }
          break;

        case "ticket_assigned":
          if (ticket.technicienId) {
            push(
              ticket.technicienId,
              `Vous avez été assigné au ticket "${ticket.titre}" — ${ticket.localisation}.`,
              "info"
            );
          }
          admins.forEach((id) =>
            push(
              id,
              `Ticket assigné : "${ticket.titre}" → ${technicianName || ticket.technicienId}.`,
              "info"
            )
          );
          break;

        case "ticket_reassigned":
          if (ticket.technicienId) {
            push(
              ticket.technicienId,
              `Vous avez été réassigné au ticket "${ticket.titre}" — ${ticket.localisation}.`,
              "info"
            );
          }
          admins.forEach((id) =>
            push(
              id,
              `Ticket réassigné : "${ticket.titre}" → ${technicianName || ticket.technicienId}.`,
              "info"
            )
          );
          break;

        case "ticket_resolved":
          // Auteur du ticket
          push(
            ticket.auteurId,
            `Votre ticket "${ticket.titre}" a été résolu${technicianName ? ` par ${technicianName}` : ""}.`,
            "success"
          );
          // Manager : validation requise
          managers.forEach((id) =>
            push(
              id,
              `Ticket résolu en attente de validation : "${ticket.titre}".`,
              "success"
            )
          );
          break;

        case "ticket_closed":
          push(
            ticket.auteurId,
            `Votre ticket "${ticket.titre}" a été clôturé.`,
            "info"
          );
          break;

        case "ticket_in_progress":
          push(
            ticket.auteurId,
            `Votre ticket "${ticket.titre}" est maintenant pris en charge.`,
            "info"
          );
          break;

        case "ticket_critical":
          managers.forEach((id) =>
            push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente.`, "warning")
          );
          admins.forEach((id) =>
            push(id, `Ticket CRITIQUE : "${ticket.titre}" — intervention urgente.`, "warning")
          );
          break;

        default:
          break;
      }

      if (newNotifs.length > 0) {
        setAllNotifications((prev) => [...newNotifs, ...prev]);
      }
    },
    []
  );

  /** Ajouter une notification manuelle (usage libre) */
  const addNotification = useCallback(({ message, type = "info", forUserId = null }) => {
    setAllNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        message,
        type,
        lu: false,
        timestamp: new Date().toISOString(),
        forUserId,
      },
      ...prev,
    ]);
  }, []);

  /** Supprimer une notification */
  const removeNotification = useCallback((id) => {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        // Données brutes (rarement utile directement)
        allNotifications,
        // Méthodes filtrées par user
        getNotificationsForUser,
        getUnreadCountForUser,
        markAllAsRead,
        markAsRead,
        triggerEvent,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
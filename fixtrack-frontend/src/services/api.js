// src/services/api.js
// ─── Service centralisé pour tous les appels API vers le backend ──────────────
// Installe axios dans le frontend : npm install axios

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Instance axios avec config de base ───────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Intercepteur : ajoute automatiquement le token JWT à chaque requête ──────
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Intercepteur réponse : gère les 401 (token expiré) ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → déconnecte l'utilisateur
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// ─────────────────────────────────────────────────────────────────────────────
//  TICKETS
// ─────────────────────────────────────────────────────────────────────────────
export const ticketService = {
  getAll: (params) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data),
  updateStatus: (id, statut) => api.patch(`/tickets/${id}/status`, { statut }),
  assign: (id, techId) =>
    api.patch(`/tickets/${id}/assign`, { technicienId: techId }),
  suggestTechnician: (id) => api.get(`/tickets/${id}/suggest-technician`),
  addNote: (id, data) => api.post(`/tickets/${id}/notes`, data),
  resolve: (id, solution) => api.patch(`/tickets/${id}/resolve`, { solution }),
  validate: (id, commentaire) =>
    api.patch(`/tickets/${id}/validate`, { commentaire }),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  USERS
// ─────────────────────────────────────────────────────────────────────────────
export const userService = {
  getAll: () => api.get("/users"),
  getTechnicians: () => api.get("/users/technicians"),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  MACHINES
// ─────────────────────────────────────────────────────────────────────────────
export const machineService = {
  getAll: (params) => api.get("/machines", { params }),
  getById: (id) => api.get(`/machines/${id}`),
  getHistory: (id) => api.get(`/machines/${id}/history`),
  create: (data) => api.post("/machines", data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
};

// ─────────────────────────────────────────────────────────────────────────────
//  STATS
// ─────────────────────────────────────────────────────────────────────────────
export const statsService = {
  manager: () => api.get("/stats/manager"),
  admin: () => api.get("/stats/admin"),
  technician: (id) => api.get(`/stats/technician/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export const exportService = {
  excel: () => api.get("/export/excel", { responseType: "blob" }),
  pdf: () => api.get("/export/pdf", { responseType: "blob" }),
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAINTENANCE
// ─────────────────────────────────────────────────────────────────────────────
export const maintenanceService = {
  getAll: () => api.get("/maintenance"),
  create: (data) => api.post("/maintenance", data),
  update: (id, data) => api.patch(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// src/services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.token) config.headers.Authorization = `Bearer ${parsed.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

export const ticketService = {
  getAll: (params) => api.get("/tickets", { params }).then((r) => r.data),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data).then((r) => r.data),
  update: (id, data) => api.put(`/tickets/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/tickets/${id}`).then((r) => r.data),
  updateStatus: (id, statut) =>
    api.patch(`/tickets/${id}/status`, { statut }).then((r) => r.data),
  assign: (id, techId) =>
    api
      .patch(`/tickets/${id}/assign`, { technicienId: techId })
      .then((r) => r.data),
  suggestTechnician: (id) => api.get(`/tickets/${id}/suggest-technician`),
  addNote: (id, data) => api.post(`/tickets/${id}/notes`, data),
  resolve: (id, solution) => api.patch(`/tickets/${id}/resolve`, { solution }),
  validate: (id, commentaire) =>
    api.patch(`/tickets/${id}/validate`, { commentaire }),
  refuse: (id, reason) =>
    api.patch(`/tickets/${id}/refuse`, { reason }).then((r) => r.data),
  saveFeedback: (id, data) =>
    api.patch(`/tickets/${id}/feedback`, data).then((r) => r.data),
};

export const userService = {
  getAll: () => api.get("/users").then((r) => r.data),
  getTechnicians: () => api.get("/users/technicians").then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  // ── Compte connecté ───────────────────────────────────────────────────────
  updateProfile: (data) => api.put("/users/profile", data).then((r) => r.data),
  changePassword: (data) =>
    api.put("/users/password", data).then((r) => r.data),
};

export const notificationService = {
  getAll: () => api.get("/notifications").then((r) => r.data),
  create: (data) => api.post("/notifications", data).then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

export const statsService = {
  manager: () => api.get("/stats/manager").then((r) => r.data),
  admin: () => api.get("/stats/admin").then((r) => r.data),
  technician: (id) => api.get(`/stats/technician/${id}`).then((r) => r.data),
};

export const exportService = {
  excel: () => api.get("/export/excel", { responseType: "blob" }),
  pdf: () => api.get("/export/pdf", { responseType: "blob" }),
};

export const maintenanceService = {
  getAll: () => api.get("/maintenance"),
  create: (data) => api.post("/maintenance", data),
  update: (id, data) => api.patch(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

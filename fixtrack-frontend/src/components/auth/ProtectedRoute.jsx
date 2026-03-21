// src/components/auth/ProtectedRoute.jsx
// ✅ Attend la vérification du token (authChecked) avant de rediriger

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuth, authChecked, loading } = useAuth();

  // ✅ Tant que la vérification GET /api/auth/me n'est pas terminée → spinner
  // (évite un redirect vers /login au premier chargement si le token est valide)
  if (!authChecked || loading) {
    return <LoadingSpinner size={40} />;
  }

  // Pas connecté → login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Rôle non autorisé → dashboard du rôle actuel
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const redirects = {
      employee:   "/employee/dashboard",
      technician: "/technician/dashboard",
      manager:    "/manager/dashboard",
      admin:      "/admin/dashboard",
    };
    return <Navigate to={redirects[user?.role] || "/login"} replace />;
  }

  return children;
}
// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import DetailTicket from "./pages/employee/DetailTicket";
import theme from "./theme/index";

// Auth pages
import LoginPage  from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";

// Layout
import Layout from "./components/layout/Layout";

// ─── Page placeholder ─────────────────────────────────────────────────────────
// Remplace ces imports par vos vraies pages quand elles seront prêtes
function PlaceholderPage({ title }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: "40px 32px",
      border: "1px solid #E5E7EB",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
      <h2 style={{ margin: "0 0 8px", color: "#111827", fontSize: 20, fontWeight: 700 }}>
        {title}
      </h2>
      <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
        Cette page est en cours de développement.
      </p>
    </div>
  );
}

// ─── Route protégée ───────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const user = localStorage.getItem("currentUser");
  return user ? children : <Navigate to="/login" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authPage, setAuthPage] = useState("login");

  // Vérifie si l'user est connecté
  const isAuthenticated = !!localStorage.getItem("currentUser");

  // Simule une connexion rapide pour tester le Layout
  const handleLoginSuccess = (role = "admin") => {
    localStorage.setItem("currentUser", JSON.stringify({
      name: "Jean Dupont",
      role,          // "employee" | "technician" | "manager" | "admin"
      email: "jean@fixtrack.app",
    }));
    window.location.href = `/${role}/dashboard`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
        <Routes>

          {/* ── Auth ── */}
          <Route path="/login" element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : authPage === "login"
                ? <LoginPage
                    onSwitchToSignup={() => setAuthPage("signup")}
                    onLoginSuccess={handleLoginSuccess}   // ← passer au LoginPage
                  />
                : <SignUpPage onSwitchToLogin={() => setAuthPage("login")} />
          } />
          <Route path="/signup" element={
            <SignUpPage onSwitchToLogin={() => setAuthPage("login")} />
          } />

          {/* ── Pages protégées avec Layout ── */}
          <Route path="/*" element={
            <PrivateRoute>
              <Layout notifCount={3}>
                <Routes>
                  {/* Employee */}
                  <Route path="employee/dashboard" element={<PlaceholderPage title="Dashboard Employé" />} />
                  <Route path="employee/tickets"   element={<PlaceholderPage title="Mes Tickets" />} />
                  <Route path="employee/tickets/new" element={<PlaceholderPage title="Nouveau Ticket" />} />

                  {/* Technician */}
                  <Route path="technician/dashboard" element={<PlaceholderPage title="Dashboard Technicien" />} />
                  <Route path="technician/tickets"   element={<PlaceholderPage title="Tickets Assignés" />} />
                  <Route path="technician/reports"   element={<PlaceholderPage title="Rapports" />} />

                  {/* Manager */}
                  <Route path="manager/dashboard" element={<PlaceholderPage title="Dashboard Manager" />} />
                  <Route path="manager/tickets"   element={<PlaceholderPage title="Tous les Tickets" />} />
                  <Route path="manager/machines"  element={<PlaceholderPage title="Machines" />} />
                  <Route path="manager/team"      element={<PlaceholderPage title="Équipe" />} />
                  <Route path="manager/reports"   element={<PlaceholderPage title="Rapports" />} />

                  {/* Admin */}
                  <Route path="admin/dashboard" element={<PlaceholderPage title="Dashboard Admin" />} />
                  <Route path="admin/tickets"   element={<PlaceholderPage title="Tous les Tickets" />} />
                  <Route path="admin/users"     element={<PlaceholderPage title="Utilisateurs" />} />
                  <Route path="admin/machines"  element={<PlaceholderPage title="Machines" />} />
                  <Route path="admin/reports"   element={<PlaceholderPage title="Rapports" />} />
                  <Route path="admin/config"    element={<PlaceholderPage title="Configuration" />} />

                  {/* Redirect racine → dashboard du rôle */}
                  <Route path="" element={<RoleRedirect />} />
                  <Route path="*" element={<RoleRedirect />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />

        </Routes>
      
    </ThemeProvider>
  );
}

// Redirige vers le bon dashboard selon le rôle stocké
function RoleRedirect() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = user.role || "employee";
  return <Navigate to={`/${role}/dashboard`} replace />;
}
<Route path="employee/tickets/:id" element={<DetailTicket />} />
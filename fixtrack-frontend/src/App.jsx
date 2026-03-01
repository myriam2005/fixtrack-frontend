// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/index";

// Auth context
import { useAuth } from "./context/AuthContext";

import LoginPage  from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";

import Layout from "./components/layout/Layout";

import MesTickets   from "./pages/employee/MyTickets";
import CreateTicket   from "./pages/employee/CreateTicket";
import AssignedTicket from "./pages/tech/AssignedTicket";



// ── Pages réelles ─────────────────────────────────────────────────────────────
import EmpDashboard  from "./pages/employee/EmpDashboard";   // ✅ ajouté
import MyTickets from "./pages/employee/MyTickets";


// ─── Page placeholder ─────────────────────────────────────────────────────────
function PlaceholderPage({ title }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "40px 32px",
      border: "1px solid #E5E7EB", textAlign: "center",
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
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

// ─── Redirect selon rôle ─────────────────────────────────────────────────────
function RoleRedirect() {
  const { user } = useAuth();
  const role = user?.role || "employee";
  return <Navigate to={`/${role}/dashboard`} replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuth } = useAuth();

  // ── FIX : on ne rappelle plus login() ici — LoginPage s'en charge déjà
  // on redirige juste vers le bon dashboard selon le rôle reçu
  const handleLoginSuccess = (role) => {
    window.location.href = `/${role}/dashboard`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>

          {/* ── Auth ── */}
          <Route path="/login" element={
            isAuth
              ? <Navigate to="/" replace />
              : <LoginPage
                  onSwitchToSignup={() => window.location.href = "/signup"}
                  onLoginSuccess={handleLoginSuccess}
                />
          } />
          <Route path="/signup" element={
            <SignUpPage onSwitchToLogin={() => window.location.href = "/login"} />
          } />

          {/* ── Pages protégées avec Layout ── */}
          <Route path="/*" element={
            <PrivateRoute>
              <Layout notifCount={3}>
                <Routes>

                  {/* ── Employee ── */}
                  <Route path="employee/dashboard"   element={<EmpDashboard />} />
                  <Route path="employee/tickets"     element={<MyTickets/>}/>
                  <Route path="employee/tickets/new" element={<CreateTicket />} />

                  {/* ── Technician ── */}
                  <Route path="technician/dashboard" element={<PlaceholderPage title="Dashboard Technicien" />} />
                  <Route path="technician/tickets"   element={<AssignedTicket />} />
                  <Route path="technician/reports"   element={<PlaceholderPage title="Rapports" />} />

                  {/* ── Manager ── */}
                  <Route path="manager/dashboard" element={<PlaceholderPage title="Dashboard Manager" />} />
                  <Route path="manager/tickets"   element={<PlaceholderPage title="Tous les Tickets" />} />
                  <Route path="manager/team"      element={<PlaceholderPage title="Équipe" />} />
                  <Route path="manager/reports"   element={<PlaceholderPage title="Rapports" />} />

                  {/* ── Admin ── */}
                  <Route path="admin/dashboard" element={<PlaceholderPage title="Dashboard Admin" />} />
                  <Route path="admin/tickets"   element={<PlaceholderPage title="Tous les Tickets" />} />
                  <Route path="admin/users"     element={<PlaceholderPage title="Utilisateurs" />} />
                  <Route path="admin/reports"   element={<PlaceholderPage title="Rapports" />} />
                  <Route path="admin/config"    element={<PlaceholderPage title="Configuration" />} />

                  {/* Redirect racine → dashboard du rôle */}
                  <Route path=""  element={<RoleRedirect />} />
                  <Route path="*" element={<RoleRedirect />} />

                </Routes>
              </Layout>
            </PrivateRoute>
          } />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/index";

import { useAuth } from "./context/AuthContext";
import LoginPage    from "./pages/auth/LoginPage";
import SignUpPage   from "./pages/auth/SignUpPage";
import Layout       from "./components/layout/Layout";

// ── Pages réelles ──────────────────────────────────────────────────────────────
import CreateTicket   from "./pages/employee/CreateTicket";
import DetailTicket   from "./pages/employee/DetailTicket";   // ✅ modal
import AssignerTicket from "./pages/manager/AssignerTicket";

function PlaceholderPage({ title }) {
  return (
    <div style={{
      background:"#fff", borderRadius:12, padding:"40px 32px",
      border:"1px solid #E5E7EB", textAlign:"center",
    }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
      <h2 style={{ margin:"0 0 8px", color:"#111827", fontSize:20, fontWeight:700 }}>{title}</h2>
      <p style={{ color:"#6B7280", fontSize:14, margin:0 }}>Cette page est en cours de développement.</p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={`/${user?.role ?? "employee"}/dashboard`} replace />;
}

export default function App() {
  const { isAuth, login } = useAuth();

  const handleLoginSuccess = (role = "admin") => {
    login({ name: "Jean Dupont", role, email: "jean@fixtrack.app" });
    window.location.href = `/${role}/dashboard`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={
            isAuth ? <Navigate to="/" replace /> :
            <LoginPage
              onSwitchToSignup={() => window.location.href = "/signup"}
              onLoginSuccess={handleLoginSuccess}
            />
          } />
          <Route path="/signup" element={
            <SignUpPage onSwitchToLogin={() => window.location.href = "/login"} />
          } />

          <Route path="/*" element={
            <PrivateRoute>
              <Layout notifCount={3}>
                <Routes>
                  {/* Employee */}
                  <Route path="employee/dashboard"       element={<PlaceholderPage title="Dashboard Employé" />} />
                  <Route path="employee/tickets"         element={<PlaceholderPage title="Mes Tickets" />} />
                  <Route path="employee/tickets/new"     element={<CreateTicket />} />
                  <Route path="employee/tickets/:id"     element={<DetailTicket />} /> {/* ✅ modal via URL */}

                  {/* Technician */}
                  <Route path="technician/dashboard"     element={<PlaceholderPage title="Dashboard Technicien" />} />
                  <Route path="technician/tickets"       element={<PlaceholderPage title="Tickets Assignés" />} />
                  <Route path="technician/tickets/:id"   element={<DetailTicket />} />
                  <Route path="technician/reports"       element={<PlaceholderPage title="Rapports" />} />

                  {/* Manager */}
                  <Route path="manager/dashboard"        element={<PlaceholderPage title="Dashboard Manager" />} />
                  <Route path="manager/tickets"          element={<PlaceholderPage title="Tous les Tickets" />} />
                  <Route path="manager/tickets/assigner" element={<AssignerTicket />} />
                  <Route path="manager/tickets/:id"      element={<DetailTicket />} />
                  <Route path="manager/machines"         element={<PlaceholderPage title="Machines" />} />
                  <Route path="manager/team"             element={<PlaceholderPage title="Équipe" />} />
                  <Route path="manager/reports"          element={<PlaceholderPage title="Rapports" />} />

                  {/* Admin */}
                  <Route path="admin/dashboard"          element={<PlaceholderPage title="Dashboard Admin" />} />
                  <Route path="admin/tickets"            element={<PlaceholderPage title="Tous les Tickets" />} />
                  <Route path="admin/tickets/:id"        element={<DetailTicket />} />
                  <Route path="admin/users"              element={<PlaceholderPage title="Utilisateurs" />} />
                  <Route path="admin/machines"           element={<PlaceholderPage title="Machines" />} />
                  <Route path="admin/reports"            element={<PlaceholderPage title="Rapports" />} />
                  <Route path="admin/config"             element={<PlaceholderPage title="Configuration" />} />

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


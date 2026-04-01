// src/App.jsx - Version complète avec ManagerDashboard intégré
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/index";

// Auth context
import { useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";


// Auth pages
import LoginPage  from "./pages/auth/LoginPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

import Layout from "./components/layout/Layout";


import CreateTicket   from "./pages/employee/create-ticket/CreateTicket";
import AssignedTicket from "./pages/tech/assigned-ticket/AssignedTicket";

import MgrDashboard from "./pages/manager/ManagerDashboard";
import AssignTicket from "./pages/manager/AssignTickets";
// ── Pages réelles ─────────────────────────────────────────────────────────────
import EmpDashboard  from "./pages/employee/EmpDashboard";   
import MyTickets from "./pages/employee/my-ticket/MyTickets";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TechnicianDashboard from "./pages/tech/TechDashboard";
import Tickets from "./pages/admin/tickets/AllTickets";
import Users from "./pages/admin/users-management/Users.jsx"; 
import Configuration from "./pages/admin/Configuration.jsx";
import ValiderResolutions from "./pages/manager/ValiderResolutions.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import TeamPerformance from "./pages/manager/team/TeamPerformance.jsx";

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
      <NotificationProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Auth ── */}
          <Route path="/login" element={
            isAuth
              ? <Navigate to="/" replace />
              : <LoginPage
                 
                  onLoginSuccess={handleLoginSuccess}
                />
          } />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        

          {/* ── Pages protégées avec Layout ── */}
          <Route path="/*" element={
            <PrivateRoute>
              <Layout notifCount={3}>
                <Routes>

                  {/* ── Employee ── */}
                  <Route path="employee/dashboard"   element={<EmpDashboard />} />
                  <Route path="employee/tickets"     element={<MyTickets />} />
                  <Route path="employee/tickets/new" element={<CreateTicket />} /> 

                  {/* ── Technician ── */}
                  <Route path="technician/dashboard" element={<TechnicianDashboard/>} />
                  <Route path="technician/tickets"   element={<AssignedTicket />} />
                  <Route path="technician/reports"   element={<ReportsPage/>} />

                  {/* ── Manager ── */}
                  <Route path="manager/dashboard" element={<MgrDashboard />} /> 
                  <Route path="manager/tickets"   element={<AssignTicket/>} />
                  <Route path="manager/resolutions" element={<ValiderResolutions />} />
                  <Route path="manager/team"      element={<TeamPerformance />} />
                  <Route path="manager/reports"   element={<ReportsPage/>} />

                  {/* ── Admin ── */}
                  <Route path="admin/dashboard" element={<AdminDashboard />} />
                  <Route path="admin/tickets"   element={<Tickets/>} />
                  <Route path="admin/users"     element={<Users/>} />
                  <Route path="admin/reports"   element={<ReportsPage/>} />
                  <Route path="admin/config"    element={<Configuration/>} />

                  {/* Redirect racine → dashboard du rôle */}
                  <Route path=""  element={<RoleRedirect />} />
                  <Route path="*" element={<RoleRedirect />} />

                </Routes>
              </Layout>
            </PrivateRoute>
          } />

        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}
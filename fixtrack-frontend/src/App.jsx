// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

//Auth pages
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";

//Main pages
import Dashboard from "./pages/Dashboard";

//Tickets pages
import MesTickets from "./pages/tickets/MesTickets";
import CreerTicket from "./pages/tickets/CreerTicket";
import DetailTicket from "./pages/tickets/DetailTicket";

//Admin pages
import GestionUsers from "./pages/admin/GestionUsers";
import GestionMachines from "./pages/admin/GestionMachines";

//Route protection
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* ================= PROTECTED ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= TICKETS ================= */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MesTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute>
              <CreerTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <DetailTicket />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <GestionUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/machines"
          element={
            <ProtectedRoute>
              <GestionMachines />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
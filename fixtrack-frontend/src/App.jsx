// src/App.jsx
import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/index";
import LoginPage  from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import TestComponents from "./TestComponents";
export default function App() {
  const [page, setPage] = useState("login"); // "login" | "signup"

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {page === "login" ? (
        <LoginPage  onSwitchToSignup={() => setPage("signup")} />
      ) : (
        <SignUpPage onSwitchToLogin={()  => setPage("login")} />
      )}
    </ThemeProvider>
  );
}
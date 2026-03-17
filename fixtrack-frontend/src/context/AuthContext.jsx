// src/context/AuthContext.jsx  — VERSION FINALE BACKEND
import { createContext, useContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

// ── URL du backend ─────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {

  // Initialise depuis localStorage (persistance entre refreshs)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /**
   * loginWithBackend({ email, password })
   * ✅ Appelle POST /api/auth/login
   * ✅ Retourne { success, role, user } ou { success: false, error }
   */
  const loginWithBackend = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Le backend a retourné une erreur (401, 400, etc.)
        const msg = data.message || "Email ou mot de passe incorrect.";
        setError(msg);
        return { success: false, error: msg };
      }

      // ✅ Succès — data = { token, user: { id, nom, email, role, avatar, ... } }
      const userData = {
        ...data.user,
        token: data.token,
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));
      setUser(userData);

      return { success: true, role: data.user.role, user: data.user };

    } catch (err) {
      // Erreur réseau (backend pas démarré, CORS, etc.)
      const msg = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * login(userData) — version directe sans API (garde la compatibilité)
   */
  const login = useCallback((userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  }, []);

  /**
   * logout()
   */
  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  /**
   * getToken() — retourne le token JWT stocké
   */
  const getToken = useCallback(() => {
    return user?.token || null;
  }, [user]);

  const value = {
    user,             // { id, nom, email, role, avatar, token } | null
    login,            // login direct sans API
    loginWithBackend, // login via API backend ✅
    logout,
    getToken,
    isAuth: !!user,
    loading,
    error,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
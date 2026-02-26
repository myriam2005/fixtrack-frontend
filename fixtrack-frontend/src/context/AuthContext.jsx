// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

// ─── Création du Context ──────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── Hook personnalisé pour consommer le context facilement ──────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Initialise depuis localStorage au démarrage (persistance entre refreshs)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /**
   * login(userData)
   * userData : { name, role, email }
   * Sauvegarde dans localStorage ET met à jour le state React.
   */
  const login = useCallback((userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  }, []);

  /**
   * logout()
   * Vide localStorage ET remet le state à null.
   */
  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  // Valeur exposée à tous les composants enfants
  const value = {
    user,       // { name, role, email } | null
    login,      // (userData) => void
    logout,     // () => void
    isAuth: !!user,  // boolean pratique pour les guards
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
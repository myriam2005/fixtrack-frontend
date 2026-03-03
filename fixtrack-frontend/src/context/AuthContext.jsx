// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // ── FIX : si l'ancien stockage n'a pas d'id, on ignore et on reconnecte
      if (!parsed?.id) {
        localStorage.removeItem("currentUser");
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  /**
   * login(userData)
   * userData : { id, name, role, email, avatar }
   */
  const login = useCallback((userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  const value = {
    user,          // { id, name, role, email, avatar } | null
    login,
    logout,
    isAuth: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
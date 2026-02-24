/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const STORAGE_KEY = "auth_user";

export function AuthProvider({ children }) {
  // Charger user depuis localStorage dès l'initialisation (pas besoin de useEffect)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const login = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ FIX : verifyToken recharge les données FRAÎCHES depuis /api/auth/me
  // → si l'email a été modifié, le user en contexte reflétera le nouvel email
  // → le localStorage est mis à jour avec les données fraîches (pas l'inverse)
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (!stored) {
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        const parsed = JSON.parse(stored);
        if (!parsed?.token) {
          localStorage.removeItem("currentUser");
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        // Appelle GET /api/auth/me avec le token existant
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });

        if (response.ok) {
          const freshData = await response.json();

          // ✅ FIX CRITIQUE : les données fraîches du backend écrasent le localStorage
          // (et non l'inverse) → email modifié reflété immédiatement
          const freshUser = {
            token: parsed.token, // on garde le token (inchangé)
            // Données fraîches en priorité sur le localStorage
            id:          freshData.id          || freshData._id || parsed.id,
            nom:         freshData.nom         || parsed.nom,
            email:       freshData.email       || parsed.email,  // ← email frais de la DB
            role:        freshData.role        || parsed.role,
            avatar:      freshData.avatar      || parsed.avatar,
            competences: freshData.competences || parsed.competences || [],
            telephone:   freshData.telephone   ?? parsed.telephone ?? null,
          };

          // Met à jour localStorage avec les données fraîches
          localStorage.setItem("currentUser", JSON.stringify(freshUser));
          setUser(freshUser);
        } else {
          // Token invalide ou expiré → déconnexion silencieuse
          localStorage.removeItem("currentUser");
          setUser(null);
        }
      } catch {
        // Erreur réseau → mode dégradé : on garde le localStorage tel quel
        // (ne pas déconnecter si le backend est temporairement down)
        try {
          const stored = localStorage.getItem("currentUser");
          if (stored) setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("currentUser");
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    verifyToken();
  }, []);

  /**
   * loginWithBackend({ email, password })
   * ✅ Appelle POST /api/auth/login
   * ✅ Stocke les données fraîches de la DB (email à jour inclus)
   */
  const loginWithBackend = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || "Email ou mot de passe incorrect.";
        setError(msg);
        return { success: false, error: msg };
      }

      // ✅ data.user contient les données fraîches de la DB
      const userData = {
        ...data.user,
        token: data.token,
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));
      setUser(userData);

      return { success: true, role: data.user.role, user: data.user };

    } catch {
      const msg = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * login(userData) — mise à jour directe du contexte (utilisé par AccountSettingsModal)
   * ✅ FIX : met à jour à la fois le state ET le localStorage de façon cohérente
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
   * getToken()
   */
  const getToken = useCallback(() => {
    return user?.token || null;
  }, [user]);

  /**
   * refreshUser()
   * ✅ Recharge les données fraîches depuis /api/auth/me
   * → utile après une modification de profil pour synchroniser immédiatement l'UI
   */
  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.token) return;

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${parsed.token}` },
      });

      if (response.ok) {
        const freshData = await response.json();
        const freshUser = {
          token:       parsed.token,
          id:          freshData.id          || freshData._id || parsed.id,
          nom:         freshData.nom         || parsed.nom,
          email:       freshData.email       || parsed.email,
          role:        freshData.role        || parsed.role,
          avatar:      freshData.avatar      || parsed.avatar,
          competences: freshData.competences || parsed.competences || [],
          telephone:   freshData.telephone   ?? parsed.telephone ?? null,
        };
        localStorage.setItem("currentUser", JSON.stringify(freshUser));
        setUser(freshUser);
        return freshUser;
      }
    } catch {
      // silencieux
    }
  }, []);

  const value = {
    user,
    login,
    loginWithBackend,
    logout,
    getToken,
    refreshUser,    // ← nouveau : pour forcer un refresh après modif profil
    isAuth:      !!user,
    loading,
    authChecked,
    error,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
// src/context/AuthContext.jsx — VERSION FINALE BACKEND
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
  const [loading,     setLoading]     = useState(true); // true au démarrage — on vérifie le token
  const [error,       setError]       = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Vérification du token au démarrage (tâche Ola manquante)
  // Si un token existe dans localStorage → GET /api/auth/me pour vérifier qu'il est encore valide
  // Si invalide ou expiré → déconnexion automatique
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

        // ✅ Appelle GET /api/auth/me pour valider le token
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // ✅ Met à jour le user avec les données fraîches du backend
          const freshUser = {
            ...parsed,
            ...(data.user || data),
            token: parsed.token, // garde le token
          };
          localStorage.setItem("currentUser", JSON.stringify(freshUser));
          setUser(freshUser);
        } else {
          // Token invalide ou expiré → déconnexion silencieuse
          localStorage.removeItem("currentUser");
          setUser(null);
        }
      } catch {
        // Erreur réseau → on garde l'utilisateur connecté en mode dégradé
        // (ne pas déconnecter si c'est juste le backend qui est down)
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
        const msg = data.message || "Email ou mot de passe incorrect.";
        setError(msg);
        return { success: false, error: msg };
      }

      // ✅ data = { token, user: { id, nom, email, role, ... } }
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
   * login(userData) — version directe sans API (compatibilité AccountSettingsModal)
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

  const value = {
    user,
    login,
    loginWithBackend,
    logout,
    getToken,
    isAuth:      !!user,
    loading,
    authChecked, // ← utile pour ProtectedRoute (attendre la vérification avant de rediriger)
    error,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
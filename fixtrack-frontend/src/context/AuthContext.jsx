// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Normalise les anciens rôles vers les nouveaux
const normalizeRole = (role) => {
  const map = {
    user: "user",
    technicien: "technician",
    gestionnaire: "manager",
    administrateur: "admin",
  };
  return map[role] || role || "user";
};

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

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
            role:        normalizeRole(freshData.role || parsed.role), // ✅ normalisé
            avatar:      freshData.avatar      || parsed.avatar,
            competences: freshData.competences || parsed.competences || [],
            telephone:   freshData.telephone   ?? parsed.telephone ?? null,
          };

          localStorage.setItem("currentUser", JSON.stringify(freshUser));
          setUser(freshUser);
        } else {
          localStorage.removeItem("currentUser");
          setUser(null);
        }
      } catch {
        try {
          const stored = localStorage.getItem("currentUser");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.role = normalizeRole(parsed.role); // ✅ normalisé même en mode dégradé
            setUser(parsed);
          }
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

  const registerWithBackend = useCallback(
    async ({ nom, email, password, role, telephone, competences }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom,
            email,
            password,
            role: role || "user",
            telephone: telephone || null,
            competences: competences || [],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const msg = data.message || "Erreur lors de l'inscription";
          setError(msg);
          return {
            success: false,
            error: msg,
            emailAlreadyExists: data.emailAlreadyExists || false,
            emailSendError: data.emailSendError || false,
          };
        }

        if (data.requiresEmailVerification) {
          sessionStorage.setItem("pendingEmailVerification", email);
        }

        return {
          success: true,
          user: data.user,
          requiresEmailVerification: data.requiresEmailVerification || false,
          message: data.message,
        };
      } catch (err) {
        const msg =
          "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyEmailWithToken = useCallback(async (token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || "Vérification échouée";
        setError(msg);
        return {
          success: false,
          error: msg,
          tokenInvalid: data.tokenInvalid || false,
          tokenExpired: data.tokenExpired || false,
        };
      }

      sessionStorage.removeItem("pendingEmailVerification");

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch {
      const msg =
        "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const resendEmailVerification = useCallback(async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || "Erreur lors du renvoi";
        setError(msg);
        return {
          success: false,
          error: msg,
          rateLimited: data.rateLimited || false,
          alreadyVerified: data.alreadyVerified || false,
        };
      }

      return {
        success: true,
        message: data.message,
      };
    } catch {
      const msg =
        "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithBackend = useCallback(async (email, password) => {
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

      // ✅ Normalise le rôle au login
      const normalizedRole = normalizeRole(data.user.role);

      const userData = {
        ...data.user,
        role: normalizedRole,
        token: data.token,
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));
      setUser(userData);

      return { success: true, role: normalizedRole, user: userData };
    } catch {
      const msg =
        "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData) => {
    const normalized = { ...userData, role: normalizeRole(userData.role) };
    localStorage.setItem("currentUser", JSON.stringify(normalized));
    setUser(normalized);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    return user?.token || null;
  }, [user]);

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
          role:        normalizeRole(freshData.role || parsed.role), // ✅ normalisé
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
    registerWithBackend,
    verifyEmailWithToken,
    resendEmailVerification,
    logout,
    getToken,
    refreshUser,
    isAuth: !!user,
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
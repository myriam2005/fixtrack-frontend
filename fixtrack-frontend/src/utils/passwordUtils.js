// src/utils/passwordUtils.js
// ─────────────────────────────────────────────────────────────
//  Utilitaire : calcul de la force d'un mot de passe
// ─────────────────────────────────────────────────────────────

const LEVELS = [
  { score: 1, label: "Faible", color: "error" },
  { score: 2, label: "Moyen", color: "warning" },
  { score: 3, label: "Bien", color: "info" },
  { score: 4, label: "Excellent", color: "success" },
];

/**
 * @param {string} password
 * @returns {{ score: number, label: string, color: string, pct: number }}
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "error", pct: 0 };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = LEVELS.find((l) => l.score === score) ?? LEVELS[0];
  return { ...level, pct: (score / 4) * 100 };
}

// src/components/common/DashboardSharedUtils.js
// Helper functions for dashboard components (extracted to separate file for Fast Refresh)

/**
 * Retourne la salutation selon l'heure
 * @returns {string} "Bonjour" | "Bon après-midi" | "Bonsoir"
 */
export function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
}

/**
 * Formate une date en fr-FR lisible
 * @param {string|Date} d - Date à formater
 * @returns {string} Date formatée (ex: "03 mar 2026")
 */
export function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

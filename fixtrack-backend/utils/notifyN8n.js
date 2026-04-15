/**
 * utils/notifyN8n.js
 * FixTrack — n8n webhook utility
 *
 * Fire-and-forget: never blocks the API response, never throws.
 * All errors are silently swallowed (logged only in development).
 */

const axios = require("axios");

// Webhook URLs — set these in your .env
const WEBHOOKS = {
  CRITICAL_TICKET: process.env.N8N_WEBHOOK_CRITICAL_TICKET,
  TICKET_ASSIGNED: process.env.N8N_WEBHOOK_TICKET_ASSIGNED,
  WELCOME_USER: process.env.N8N_WEBHOOK_WELCOME_USER,
  TICKET_RESOLVED: process.env.N8N_WEBHOOK_TICKET_RESOLVED,
  ACCOUNT_REQUEST: process.env.N8N_WEBHOOK_ACCOUNT_REQUEST, // ← NEW
};

/**
 * Sends a POST payload to an n8n webhook.
 * Returns immediately — the HTTP call happens in the background.
 *
 * @param {string} webhookUrl  - Full URL of the n8n webhook node
 * @param {object} payload     - JSON-serialisable data to send
 */
function notifyN8n(webhookUrl, payload) {
  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[notifyN8n] Webhook URL is not defined. Skipping.");
    }
    return;
  }

  // Intentionally NOT awaited — fire and forget
  axios
    .post(webhookUrl, payload, {
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
    })
    .then(() => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[notifyN8n] ✓ Webhook triggered: ${webhookUrl}`);
      }
    })
    .catch((err) => {
      // Silent fail in production, logged in development
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[notifyN8n] ✗ Webhook failed (${webhookUrl}):`,
          err.message,
        );
      }
    });
}

module.exports = { notifyN8n, WEBHOOKS };

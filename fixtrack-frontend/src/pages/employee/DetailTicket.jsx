
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Rating,
  TextField,
  Button,
} from "@mui/material";

import { tickets, machines, users } from "../../mockData";

// Helpers
const normalizeStatus = (s) => (s || "").toString().trim().toLowerCase();

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("fr-FR");
}

function statusChipProps(statusRaw) {
  const status = normalizeStatus(statusRaw);

  // adapte si ton projet utilise d'autres valeurs
  if (status === "open" || status === "ouvert") return { label: "Ouvert", color: "info" };
  if (status === "in_progress" || status === "en cours" || status === "inprogress")
    return { label: "En cours", color: "warning" };
  if (status === "pending" || status === "en attente") return { label: "En attente", color: "default" };
  if (status === "resolved" || status === "résolu" || status === "resolu") return { label: "Résolu", color: "success" };
  if (status === "closed" || status === "clôturé" || status === "cloture") return { label: "Clôturé", color: "default" };

  return { label: statusRaw || "—", color: "default" };
}

function priorityChipProps(priorityRaw) {
  const p = (priorityRaw || "").toString().trim().toLowerCase();

  if (p === "critique") return { label: "Critique", color: "error" };
  if (p === "haute") return { label: "Haute", color: "warning" };
  if (p === "moyenne") return { label: "Moyenne", color: "info" };
  if (p === "basse") return { label: "Basse", color: "default" };

  return { label: priorityRaw || "—", color: "default" };
}

// Timeline extraction (robuste selon la forme de tes données)
function getTimeline(ticket) {
  // essaie plusieurs champs possibles
  const raw =
    ticket?.history ||
    ticket?.historique ||
    ticket?.timeline ||
    ticket?.statusHistory ||
    null;

  // 1) Si on a un tableau d'événements dédié
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((e) => ({
        date: e.date || e.at || e.createdAt || e.time,
        description:
          e.description ||
          e.message ||
          (e.newStatus ? `Statut → ${e.newStatus}` : null) ||
          (e.statut ? `Statut → ${e.statut}` : null) ||
          JSON.stringify(e),
      }))
      .filter((e) => e.date || e.description);
  }

  // 2) Sinon, tenter à partir de notes
  if (Array.isArray(ticket?.notes) && ticket.notes.length) {
    return ticket.notes
      .map((n) => {
        // note peut être string ou objet
        if (typeof n === "string") {
          return { date: null, description: n };
        }
        return {
          date: n.date || n.at || n.createdAt,
          description:
            n.description ||
            n.message ||
            (n.newStatus ? `Statut → ${n.newStatus}` : null) ||
            (n.statut ? `Statut → ${n.statut}` : null) ||
            null,
        };
      })
      .filter((e) => e.description);
  }

  // 3) Fallback minimal : création du ticket
  return [
    {
      date: ticket?.dateCreation,
      description: "Ticket créé",
    },
  ];
}

export default function DetailTicket() {
  const { id } = useParams(); // récupère l'id depuis /employee/tickets/:id
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const ticket = useMemo(
    () => tickets.find((t) => String(t.id) === String(id)),
    [id]
  );

  const machine = useMemo(() => {
    if (!ticket) return null;
    return machines.find((m) => String(m.id) === String(ticket.machineId)) || null;
  }, [ticket]);

  const technician = useMemo(() => {
    if (!ticket || ticket.technicienId == null) return null;
    return users.find((u) => String(u.id) === String(ticket.technicienId)) || null;
  }, [ticket]);

  const timeline = useMemo(() => (ticket ? getTimeline(ticket) : []), [ticket]);

  if (!ticket) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Ticket introuvable</Typography>
        <Typography sx={{ mt: 1, color: "text.secondary" }}>
          Aucun ticket ne correspond à l’id: <b>{id}</b>
        </Typography>
      </Paper>
    );
  }

  const statusProps = statusChipProps(ticket.statut);
  const priorityProps = priorityChipProps(ticket.priorite);
  const isResolved = normalizeStatus(ticket.statut) === "resolved" || normalizeStatus(ticket.statut) === "résolu" || normalizeStatus(ticket.statut) === "resolu";

  const handleSendFeedback = () => {
    // ici tu peux appeler ton API plus tard
    // pour l’instant on simule
    console.log("Feedback envoyé:", {
      ticketId: ticket.id,
      rating,
      comment,
    });
    alert("Feedback envoyé ✅");
    setRating(0);
    setComment("");
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {/* HEADER */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {ticket.titre}
            </Typography>
            <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
              Créé le : {formatDate(ticket.dateCreation)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip label={statusProps.label} color={statusProps.color} />
            <Chip label={priorityProps.label} color={priorityProps.color} variant="outlined" />
          </Box>
        </Box>
      </Paper>

      {/* INFOS */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Informations
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography>
            <b>Machine concernée :</b>{" "}
            {machine ? `${machine.nom} — ${machine.localisation} (${machine.categorie})` : "—"}
          </Typography>

          <Typography>
            <b>Technicien assigné :</b>{" "}
            {technician ? `${technician.nom} (${technician.email})` : "Non assigné"}
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Description complète</Typography>
            <Typography sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>
              {ticket.description || "—"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* TIMELINE */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Historique (Timeline)
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List sx={{ p: 0 }}>
          {timeline.map((e, idx) => (
            <ListItem key={idx} sx={{ px: 0, alignItems: "flex-start" }}>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 700 }}>
                    {e.date ? formatDate(e.date) : "—"}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: "text.secondary" }}>
                    {e.description}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* FEEDBACK */}
      {isResolved && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Feedback
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography sx={{ mb: 1 }}>
            Note (5 étoiles) :
          </Typography>

          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            max={5}
          />

          <TextField
            sx={{ mt: 2 }}
            label="Commentaire"
            fullWidth
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={handleSendFeedback}
            disabled={rating === 0}
          >
            Envoyer
          </Button>
        </Paper>
      )}
    </Box>
  );
}
// controllers/ticketController.js
const { validationResult } = require("express-validator");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const createLog = require("../utils/createLog");
const sendNotification = require("../utils/sendNotification");
const calculatePriority = require("../utils/priorityAI");

// Valid status transitions
const STATUS_TRANSITIONS = {
  open: ["assigned", "in_progress"],
  assigned: ["in_progress", "open"],
  in_progress: ["pending", "resolved"],
  pending: ["in_progress", "resolved"],
  resolved: ["closed", "in_progress"],
  closed: [], // terminal state
};

// ── POST /api/tickets ─────────────────────────────────────────────────────────
const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      titre,
      description,
      categorie,
      localisation,
      urgence,
      machineId,
      auteurTel,
    } = req.body;

    // IA: calcule la priorité automatiquement
    const { score, priorite } = await calculatePriority({
      categorie,
      urgence,
      machineId,
      localisation,
    });

    const ticket = await Ticket.create({
      titre,
      description,
      categorie,
      localisation,
      auteurId: req.user.id,
      auteurTel: auteurTel || null,
      machineId: machineId || null,
      priorite,
      scoreIA: score,
    });

    // Notifie les managers si ticket critique
    if (priorite === "critical") {
      const managers = await User.find({
        role: { $in: ["manager", "admin"] },
        actif: true,
      });
      for (const m of managers) {
        await sendNotification(
          m._id,
          `Ticket critique ouvert : ${titre}`,
          "ticket_critical",
          ticket._id,
        );
      }
    }

    await createLog(
      "TICKET_CREATED",
      `Ticket créé : ${titre}`,
      req.user.id,
      "info",
      ticket._id.toString(),
      "Ticket",
    );

    const populated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email avatar telephone")
      .populate("technicienId", "nom email avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/tickets ──────────────────────────────────────────────────────────
const getTickets = async (req, res) => {
  try {
    const { statut, priorite, categorie, technicienId } = req.query;
    const filter = {};

    // Filtres selon rôle
    if (req.user.role === "employee") {
      filter.auteurId = req.user.id;
    } else if (req.user.role === "technician") {
      filter.technicienId = req.user.id;
    }

    // Filtres optionnels depuis query params
    if (statut) filter.statut = statut;
    if (priorite) filter.priorite = priorite;
    if (categorie) filter.categorie = categorie;
    if (technicienId && ["manager", "admin"].includes(req.user.role)) {
      filter.technicienId = technicienId;
    }

    const tickets = await Ticket.find(filter)
      .populate("auteurId", "nom email avatar telephone")
      .populate("technicienId", "nom email avatar")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/tickets/:id ──────────────────────────────────────────────────────
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("auteurId", "nom email avatar telephone")
      .populate("technicienId", "nom email avatar competences")
      .populate("machineId", "nom localisation categorie")
      .populate("notes.auteur", "nom avatar role");

    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/tickets/:id/status ─────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

    // Vérifie que la transition est valide
    const allowed = STATUS_TRANSITIONS[ticket.statut] || [];
    if (!allowed.includes(statut)) {
      return res.status(400).json({
        message: `Transition invalide : ${ticket.statut} → ${statut}. Transitions autorisées : ${allowed.join(", ")}`,
      });
    }

    ticket.statut = statut;
    await ticket.save();

    // Notifie l'auteur
    await sendNotification(
      ticket.auteurId,
      `Votre ticket '${ticket.titre}' est maintenant : ${statut}`,
      "status_changed",
      ticket._id,
    );

    await createLog(
      "TICKET_STATUS_UPDATED",
      `Statut → ${statut} pour ticket: ${ticket.titre}`,
      req.user.id,
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/tickets/:id/assign — manager only ──────────────────────────────
const assignTicket = async (req, res) => {
  try {
    const { technicienId } = req.body;

    // Vérifie que le technicien existe
    const technician = await User.findOne({
      _id: technicienId,
      role: "technician",
      actif: true,
    });
    if (!technician)
      return res
        .status(404)
        .json({ message: "Technicien non trouvé ou inactif" });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { technicienId, statut: "assigned" },
      { new: true },
    )
      .populate("auteurId", "nom email avatar")
      .populate("technicienId", "nom email avatar");

    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

    // Notifie le technicien
    await sendNotification(
      technicienId,
      `Nouveau ticket assigné : ${ticket.titre}`,
      "ticket_assigned",
      ticket._id,
    );

    await createLog(
      "TICKET_ASSIGNED",
      `Ticket assigné à ${technician.nom}`,
      req.user.id,
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/tickets/:id/suggest-technician ───────────────────────────────────
const suggestTechnician = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

    const technicians = await User.find({
      role: "technician",
      actif: true,
    }).select("-password");

    // Calcule un score de pertinence pour chaque technicien
    const scored = await Promise.all(
      technicians.map(async (tech) => {
        let score = 0;

        // +40 si compétence correspond à la catégorie
        if (tech.competences && tech.competences.includes(ticket.categorie)) {
          score += 40;
        }

        // -10 par ticket en cours (charge de travail)
        const activeTickets = await Ticket.countDocuments({
          technicienId: tech._id,
          statut: { $in: ["assigned", "in_progress"] },
        });
        score -= activeTickets * 10;

        // +20 si déjà résolu des tickets de même catégorie
        const resolvedSimilar = await Ticket.countDocuments({
          technicienId: tech._id,
          categorie: ticket.categorie,
          statut: { $in: ["resolved", "closed"] },
        });
        if (resolvedSimilar > 0) score += 20;

        return { technician: tech, score, activeTickets, resolvedSimilar };
      }),
    );

    // Trie par score décroissant
    scored.sort((a, b) => b.score - a.score);

    res.json({
      recommended: scored[0] || null,
      all: scored,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/tickets/:id/notes — technician ──────────────────────────────────
const addNote = async (req, res) => {
  try {
    const { texte, type } = req.body;
    if (!texte)
      return res
        .status(400)
        .json({ message: "Le texte de la note est requis" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

    ticket.notes.push({
      auteur: req.user.id,
      texte,
      type: type || "note",
      date: new Date(),
    });
    await ticket.save();

    const updated = await Ticket.findById(ticket._id).populate(
      "notes.auteur",
      "nom avatar role",
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/tickets/:id/resolve — technician ───────────────────────────────
const resolveTicket = async (req, res) => {
  try {
    const { solution } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

    ticket.statut = "resolved";
    if (solution) {
      ticket.notes.push({
        auteur: req.user.id,
        texte: solution,
        type: "solution",
        date: new Date(),
      });
    }
    await ticket.save();

    // Notifie l'auteur et le manager
    await sendNotification(
      ticket.auteurId,
      `Votre ticket '${ticket.titre}' a été résolu`,
      "ticket_resolved",
      ticket._id,
    );

    const managers = await User.find({
      role: { $in: ["manager", "admin"] },
      actif: true,
    });
    for (const m of managers) {
      await sendNotification(
        m._id,
        `Ticket '${ticket.titre}' résolu — en attente de validation`,
        "ticket_resolved",
        ticket._id,
      );
    }

    await createLog(
      "TICKET_RESOLVED",
      `Ticket résolu : ${ticket.titre}`,
      req.user.id,
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/tickets/:id/validate — manager ─────────────────────────────────
const validateTicket = async (req, res) => {
  try {
    const { commentaire } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

    ticket.statut = "closed";
    if (commentaire) {
      ticket.notes.push({
        auteur: req.user.id,
        texte: commentaire,
        type: "validation",
        date: new Date(),
      });
    }
    await ticket.save();

    // Notifie le technicien
    if (ticket.technicienId) {
      await sendNotification(
        ticket.technicienId,
        `Ticket '${ticket.titre}' validé et fermé`,
        "ticket_validated",
        ticket._id,
      );
    }

    await createLog(
      "TICKET_VALIDATED",
      `Ticket validé : ${ticket.titre}`,
      req.user.id,
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/tickets/:id — admin only ──────────────────────────────────────
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });
    res.json({ message: "Ticket supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateStatus,
  assignTicket,
  suggestTechnician,
  addNote,
  resolveTicket,
  validateTicket,
  deleteTicket,
};

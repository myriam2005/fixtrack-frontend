// controllers/ticketController.js
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const createLog = require("../utils/createLog");
const sendNotification = require("../utils/sendNotification");
const calculatePriority = require("../utils/priorityAI");

const VALID_TRANSITIONS = {
  open: ["assigned", "in_progress", "closed"],
  assigned: ["in_progress", "open", "closed"],
  in_progress: ["resolved", "assigned", "closed"],
  pending: ["assigned", "in_progress", "open"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

// ── GET /api/tickets ──────────────────────────────────────────────────────────
exports.getAllTickets = async (req, res) => {
  try {
    const { statut, priorite, technicienId, categorie } = req.query;
    const filter = {};

    if (req.user.role === "employee") filter.auteurId = req.user.id;
    if (req.user.role === "technician") filter.technicienId = req.user.id;
    if (statut) filter.statut = statut;
    if (priorite) filter.priorite = priorite;
    if (technicienId) filter.technicienId = technicienId;
    if (categorie) filter.categorie = categorie;

    const tickets = await Ticket.find(filter)
      .populate("auteurId", "nom email avatar telephone")
      .populate("technicienId", "nom email avatar competences")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── GET /api/tickets/:id ──────────────────────────────────────────────────────
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("auteurId", "nom email avatar telephone")
      .populate("technicienId", "nom email avatar competences");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── POST /api/tickets ─────────────────────────────────────────────────────────
exports.createTicket = async (req, res) => {
  try {
    let {
      titre,
      description,
      categorie,
      categorieAutre,
      localisation,
      auteurTel,
      urgence,
    } = req.body;

    if (!titre || !titre.trim())
      return res.status(400).json({ message: "Le titre est requis" });
    if (!localisation || !localisation.trim())
      return res.status(400).json({ message: "La localisation est requise" });

    if (!categorie || !categorie.trim()) categorie = "Autre";
    if (categorie === "Autre" && categorieAutre && categorieAutre.trim()) {
      categorie = `Autre — ${categorieAutre.trim()}`;
    }

    const { priorite, score } = await calculatePriority({
      categorie,
      urgence: urgence || "medium",
      localisation: localisation.trim(),
      description: description || "",
    });

    const ticket = await new Ticket({
      titre: titre.trim(),
      description: (description || "").trim(),
      categorie,
      localisation: localisation.trim(),
      priorite,
      scoreIA: score,
      auteurId: req.user.id,
      auteurTel: auteurTel || null,
      statut: "open",
    }).save();

    await createLog(
      "TICKET_CREATED",
      `Ticket: "${titre}" | catégorie: ${categorie} | priorité IA: ${priorite} (${score})`,
      req.user.id,
    );

    const managers = await User.find({
      role: { $in: ["manager", "admin"] },
      actif: true,
    });

    await Promise.all(
      managers.map((m) =>
        sendNotification({
          userId: m._id,
          message: `📋 Nouveau ticket: "${titre}" — priorité: ${priorite} | ${localisation}`,
          type: "ticket_created",
          ticketId: ticket._id,
        }),
      ),
    );

    if (priorite === "critical") {
      await Promise.all(
        managers.map((m) =>
          sendNotification({
            userId: m._id,
            message: `🚨 Ticket CRITIQUE: "${titre}" — intervention urgente requise`,
            type: "ticket_critical",
            ticketId: ticket._id,
          }),
        ),
      );
    }

    const populated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email avatar")
      .populate("technicienId", "nom email avatar");

    res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE TICKET ERROR:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/tickets/:id ──────────────────────────────────────────────────────
exports.updateTicket = async (req, res) => {
  try {
    const { titre, description, categorie, localisation, priorite, statut } =
      req.body;
    const update = {};
    if (titre !== undefined) update.titre = titre;
    if (description !== undefined) update.description = description;
    if (categorie !== undefined) update.categorie = categorie;
    if (localisation !== undefined) update.localisation = localisation;
    if (priorite !== undefined) update.priorite = priorite;
    if (statut !== undefined) update.statut = statut;

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    await createLog(
      "TICKET_UPDATED",
      `Ticket modifié: ${ticket.titre}`,
      req.user.id,
    );
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── DELETE /api/tickets/:id ───────────────────────────────────────────────────
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });
    await createLog(
      "TICKET_DELETED",
      `Supprimé: ${ticket.titre}`,
      req.user.id,
      "warning",
    );
    res.json({ message: "Ticket supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/status ────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const allowed = VALID_TRANSITIONS[ticket.statut] || [];
    if (!allowed.includes(statut))
      return res.status(400).json({
        message: `Transition invalide: ${ticket.statut} → ${statut}`,
        allowed,
      });

    const oldStatut = ticket.statut;
    ticket.statut = statut;
    await ticket.save();

    await createLog(
      "STATUS_CHANGED",
      `"${ticket.titre}": ${oldStatut} → ${statut}`,
      req.user.id,
    );

    if (["in_progress", "resolved", "closed"].includes(statut)) {
      await sendNotification({
        userId: ticket.auteurId,
        message: `Votre ticket "${ticket.titre}" est maintenant: ${statut}`,
        type: "status_changed",
        ticketId: ticket._id,
      });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/assign ────────────────────────────────────────────
exports.assignTicket = async (req, res) => {
  try {
    const { technicienId } = req.body;
    const tech = await User.findById(technicienId);
    if (!tech || tech.role !== "technician")
      return res.status(400).json({ message: "Technicien invalide" });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { technicienId, statut: "assigned" },
      { new: true },
    )
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email avatar competences");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    await createLog(
      "TICKET_ASSIGNED",
      `"${ticket.titre}" → ${tech.nom}`,
      req.user.id,
    );
    await sendNotification({
      userId: technicienId,
      message: `Nouveau ticket: ${ticket.titre}`,
      type: "ticket_assigned",
      ticketId: ticket._id,
    });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── GET /api/tickets/:id/suggest-technician ───────────────────────────────────
exports.suggestTechnician = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const techs = await User.find({ role: "technician", actif: true });
    const allTickets = await Ticket.find({
      statut: { $in: ["assigned", "in_progress"] },
    });

    const scored = await Promise.all(
      techs.map(async (tech) => {
        let score = 0;
        const tid = tech._id.toString();

        if (
          tech.competences?.some(
            (c) =>
              ticket.categorie?.toLowerCase().includes(c.toLowerCase()) ||
              c.toLowerCase().includes(ticket.categorie?.toLowerCase()),
          )
        )
          score += 40;

        const active = allTickets.filter(
          (t) => t.technicienId?.toString() === tid,
        ).length;
        score -= active * 10;

        const past = await Ticket.countDocuments({
          technicienId: tech._id,
          localisation: {
            $regex: new RegExp(ticket.localisation?.split(" ")[0] || "", "i"),
          },
          statut: { $in: ["resolved", "closed"] },
        });
        if (past > 0) score += 20;

        return {
          technicien: {
            _id: tech._id,
            nom: tech.nom,
            email: tech.email,
            competences: tech.competences,
          },
          score,
          activeTickets: active,
          pastResolved: past,
        };
      }),
    );

    scored.sort((a, b) => b.score - a.score);
    res.json({ suggested: scored[0] || null, all: scored });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── POST /api/tickets/:id/notes ───────────────────────────────────────────────
exports.addNote = async (req, res) => {
  try {
    const { texte } = req.body;
    if (!texte) return res.status(400).json({ message: "Le texte est requis" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    ticket.notes.push({ auteur: req.user.id, texte, date: new Date() });
    await ticket.save();
    await createLog("NOTE_ADDED", `Note sur "${ticket.titre}"`, req.user.id);

    const updated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/resolve ───────────────────────────────────────────
exports.resolveTicket = async (req, res) => {
  try {
    const { solution } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    ticket.statut = "resolved";
    if (solution)
      ticket.notes.push({
        auteur: req.user.id,
        texte: `✅ SOLUTION: ${solution}`,
        type: "solution",
        date: new Date(),
      });
    await ticket.save();

    await createLog(
      "TICKET_RESOLVED",
      `Résolu: "${ticket.titre}"`,
      req.user.id,
    );
    await sendNotification({
      userId: ticket.auteurId,
      message: `Ticket "${ticket.titre}" résolu.`,
      type: "ticket_resolved",
      ticketId: ticket._id,
    });

    const managers = await User.find({
      role: { $in: ["manager", "admin"] },
      actif: true,
    });
    await Promise.all(
      managers.map((m) =>
        sendNotification({
          userId: m._id,
          message: `Ticket "${ticket.titre}" résolu — attente validation`,
          type: "ticket_resolved",
          ticketId: ticket._id,
        }),
      ),
    );

    const updated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/validate ──────────────────────────────────────────
exports.validateTicket = async (req, res) => {
  try {
    const { commentaire } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    ticket.statut = "closed";
    if (commentaire)
      ticket.notes.push({
        auteur: req.user.id,
        texte: `🔒 VALIDATION: ${commentaire}`,
        type: "validation",
        date: new Date(),
      });
    await ticket.save();

    await createLog(
      "TICKET_VALIDATED",
      `Clôturé: "${ticket.titre}"`,
      req.user.id,
    );
    if (ticket.technicienId) {
      await sendNotification({
        userId: ticket.technicienId,
        message: `Ticket "${ticket.titre}" validé.`,
        type: "ticket_validated",
        ticketId: ticket._id,
      });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

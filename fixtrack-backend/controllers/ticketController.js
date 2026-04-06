// controllers/ticketController.js
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const createLog = require("../utils/createLog");
const sendNotification = require("../utils/sendNotification");
const calculatePriority = require("../utils/priorityAI");
const { notifyN8n, WEBHOOKS } = require("../utils/notifyN8n");

const VALID_TRANSITIONS = {
  open: ["assigned", "in_progress", "closed"],
  assigned: ["in_progress", "open", "closed", "refused"],
  in_progress: ["resolved", "assigned", "closed"],
  pending: ["assigned", "in_progress", "open"],
  resolved: ["closed", "in_progress"],
  refused: ["open", "assigned"],
  closed: [],
};

// ── GET /api/tickets ──────────────────────────────────────────────────────────
exports.getAllTickets = async (req, res) => {
  try {
    const { statut, priorite, technicienId, categorie } = req.query;
    const filter = {};

    if (req.user.role === "user") filter.auteurId = req.user.id;
    if (req.user.role === "technician") filter.technicienId = req.user.id;
    if (statut) filter.statut = statut;
    if (priorite) filter.priorite = priorite;
    if (technicienId) filter.technicienId = technicienId;
    if (categorie) filter.categorie = categorie;

    const tickets = await Ticket.find(filter)
      .populate("auteurId", "nom email avatar telephone")
      .populate("technicienId", "nom email avatar competences")
      .populate("refusedBy", "nom email")
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
      .populate("technicienId", "nom email avatar competences")
      .populate("refusedBy", "nom email");
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

    if (!titre?.trim())
      return res.status(400).json({ message: "Le titre est requis" });
    if (!localisation?.trim())
      return res.status(400).json({ message: "La localisation est requise" });

    if (!categorie?.trim()) categorie = "Autre";
    if (categorie === "Autre" && categorieAutre?.trim())
      categorie = `Autre — ${categorieAutre.trim()}`;

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

    // ── Récupère le vrai nom de l'auteur depuis la base ────────────────
    const auteurDoc = await User.findById(req.user.id).select("nom email");
    const auteurNom =
      auteurDoc?.nom || auteurDoc?.email || "Utilisateur inconnu";

    const managers = await User.find({
      role: { $in: ["manager", "admin"] },
      actif: true,
    });

    await Promise.all(
      managers.map((m) =>
        sendNotification({
          userId: m._id,
          message: `Nouveau ticket de ${auteurNom} : "${titre}" — priorité: ${priorite} | ${localisation}`,
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
            message: `🚨 Ticket CRITIQUE de ${auteurNom} : "${titre}" — intervention urgente requise`,
            type: "ticket_critical",
            ticketId: ticket._id,
          }),
        ),
      );

      // ── n8n Workflow 1 : email critique → manager ──────────────────────
      const manager = managers[0];
      notifyN8n(WEBHOOKS.CRITICAL_TICKET, {
        ticketId: ticket._id.toString(),
        titre: ticket.titre,
        description: ticket.description,
        localisation: ticket.localisation,
        categorie: ticket.categorie,
        priorite: ticket.priorite,
        statut: ticket.statut,
        createdAt: ticket.createdAt,
        auteurNom: auteurNom,
        managerEmail: manager?.email || process.env.MANAGER_FALLBACK_EMAIL,
        managerNom: manager?.nom || "Manager",
        ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
      });
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
    const ticket = await Ticket.findById(req.params.id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const titre = ticket.titre;
    const auteurId = ticket.auteurId?._id || ticket.auteurId;
    const techId = ticket.technicienId?._id || ticket.technicienId;
    const supprimePar = req.user?.nom || req.user?.email || "un administrateur";

    await Ticket.findByIdAndDelete(req.params.id);
    await createLog(
      "TICKET_DELETED",
      `Supprimé: "${titre}" par ${supprimePar}`,
      req.user.id,
      "warning",
    );

    if (auteurId && String(auteurId) !== String(req.user.id)) {
      await sendNotification({
        userId: auteurId,
        message: `🗑️ Votre ticket "${titre}" a été supprimé par ${supprimePar}.`,
        type: "ticket_deleted",
        ticketId: null,
      });
    }
    if (techId && String(techId) !== String(req.user.id)) {
      await sendNotification({
        userId: techId,
        message: `Le ticket "${titre}" qui vous était assigné a été supprimé par ${supprimePar}.`,
        type: "ticket_deleted",
        ticketId: null,
      });
    }

    res.json({ message: "Ticket supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/status ─────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate(
      "technicienId",
      "nom email",
    );
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
        message: `Votre ticket "${ticket.titre}" est maintenant : ${statut}`,
        type: "status_changed",
        ticketId: ticket._id,
      });
    }

    if (statut === "in_progress" && oldStatut === "resolved") {
      const techId = ticket.technicienId?._id || ticket.technicienId;
      const managerNom = req.user?.nom || "Le manager";
      if (techId) {
        await sendNotification({
          userId: techId,
          message: `⚠️ ${managerNom} a rejeté votre résolution sur le ticket "${ticket.titre}". Veuillez reprendre l'intervention.`,
          type: "status_changed",
          ticketId: ticket._id,
        });
      }
    }

    const updated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/refuse ─────────────────────────────────────────────
exports.refuseTicket = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim())
      return res.status(400).json({ message: "Le motif du refus est requis" });

    const ticket = await Ticket.findById(req.params.id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const techId =
      ticket.technicienId?._id?.toString() || ticket.technicienId?.toString();
    if (techId !== req.user.id.toString())
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas assigné à ce ticket" });

    if (ticket.statut !== "assigned")
      return res
        .status(400)
        .json({ message: "Seul un ticket assigné peut être refusé" });

    const techNom = req.user?.nom || "Technicien";
    ticket.statut = "refused";
    ticket.refusedReason = reason.trim();
    ticket.refusedBy = req.user.id;
    ticket.refusedAt = new Date();
    ticket.notes.push({
      auteur: req.user.id,
      texte: `REFUS par ${techNom} : ${reason.trim()}`,
      type: "note",
      date: new Date(),
    });
    await ticket.save();

    await createLog(
      "TICKET_REFUSED",
      `"${ticket.titre}" refusé par ${techNom} — motif: ${reason}`,
      req.user.id,
      "warning",
    );

    const managers = await User.find({
      role: { $in: ["manager", "admin"] },
      actif: true,
    });
    await Promise.all(
      managers.map((m) =>
        sendNotification({
          userId: m._id,
          message: `${techNom} a refusé le ticket "${ticket.titre}" — motif : ${reason.trim()}`,
          type: "ticket_refused",
          ticketId: ticket._id,
          meta: {
            action: "reassign",
            ticketId: ticket._id.toString(),
            ticketTitre: ticket.titre,
            techNom,
            reason: reason.trim(),
            priorite: ticket.priorite,
            localisation: ticket.localisation,
          },
        }),
      ),
    );

    if (ticket.auteurId) {
      await sendNotification({
        userId: ticket.auteurId._id || ticket.auteurId,
        message: `⚠ ${techNom} n'a pas pu traiter votre ticket "${ticket.titre}". Un manager va le réassigner.`,
        type: "ticket_refused",
        ticketId: ticket._id,
      });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email")
      .populate("refusedBy", "nom email");
    res.json(updated);
  } catch (err) {
    console.error("REFUSE TICKET ERROR:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PATCH /api/tickets/:id/assign ─────────────────────────────────────────────
exports.assignTicket = async (req, res) => {
  try {
    const { technicienId } = req.body;
    const tech = await User.findById(technicienId);
    if (!tech || tech.role !== "technician")
      return res.status(400).json({ message: "Technicien invalide" });

    const managerNom = req.user?.nom || "Le manager";

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        technicienId,
        statut: "assigned",
        refusedReason: null,
        refusedBy: null,
        refusedAt: null,
      },
      { new: true },
    )
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email avatar competences");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    await createLog(
      "TICKET_ASSIGNED",
      `"${ticket.titre}" → ${tech.nom} par ${managerNom}`,
      req.user.id,
    );

    await sendNotification({
      userId: technicienId,
      message: `${managerNom} vous a assigné le ticket "${ticket.titre}"`,
      type: "ticket_assigned",
      ticketId: ticket._id,
    });

    await sendNotification({
      userId: ticket.auteurId,
      message: `Votre ticket "${ticket.titre}" a été assigné à ${tech.nom}`,
      type: "status_changed",
      ticketId: ticket._id,
    });

    // ── n8n Workflow 2 : email assigné → technicien ────────────────────
    notifyN8n(WEBHOOKS.TICKET_ASSIGNED, {
      ticketId: ticket._id.toString(),
      titre: ticket.titre,
      description: ticket.description,
      localisation: ticket.localisation,
      categorie: ticket.categorie,
      priorite: ticket.priorite,
      statut: ticket.statut,
      createdAt: ticket.createdAt,
      technicienEmail: tech.email,
      technicienNom: tech.nom,
      ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
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

        if (ticket.refusedBy?.toString() === tid) score -= 50;

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
    const { texte, type } = req.body;
    if (!texte) return res.status(400).json({ message: "Le texte est requis" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    ticket.notes.push({
      auteur: req.user.id,
      texte,
      type: type || "note",
      date: new Date(),
    });
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

// ── PATCH /api/tickets/:id/resolve ────────────────────────────────────────────
exports.resolveTicket = async (req, res) => {
  try {
    const { solution } = req.body;
    const ticket = await Ticket.findById(req.params.id)
      .populate("auteurId", "nom email")
      .populate("technicienId", "nom email");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const techNom =
      ticket.technicienId?.nom || req.user?.nom || "Un technicien";

    ticket.statut = "resolved";
    if (solution)
      ticket.notes.push({
        auteur: req.user.id,
        texte: `SOLUTION: ${solution}`,
        type: "solution",
        date: new Date(),
      });
    await ticket.save();

    await createLog(
      "TICKET_RESOLVED",
      `Résolu: "${ticket.titre}" par ${techNom}`,
      req.user.id,
    );

    await sendNotification({
      userId: ticket.auteurId,
      message: `Votre ticket "${ticket.titre}" a été résolu par ${techNom}. En attente de validation.`,
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
          message: `${techNom} a résolu le ticket "${ticket.titre}" — en attente de votre validation`,
          type: "ticket_resolved",
          ticketId: ticket._id,
        }),
      ),
    );

    // ── n8n Workflow 4 : email résolution → utilisateur ────────────────────
    const auteur = ticket.auteurId;
    if (auteur?.email) {
      notifyN8n(WEBHOOKS.TICKET_RESOLVED, {
        ticketId: ticket._id.toString(),
        titre: ticket.titre,
        description: ticket.description,
        localisation: ticket.localisation,
        categorie: ticket.categorie,
        priorite: ticket.priorite,
        solution: solution || null,
        resolvedAt: new Date().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        userEmail: auteur.email,
        userNom: auteur.nom,
        technicienNom: techNom,
        ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
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

// ── PATCH /api/tickets/:id/validate ───────────────────────────────────────────
exports.validateTicket = async (req, res) => {
  try {
    const { commentaire } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate(
      "technicienId",
      "nom email",
    );
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const techNom = ticket.technicienId?.nom || "le technicien";
    const managerNom = req.user?.nom || "Le manager";

    ticket.statut = "closed";
    if (commentaire)
      ticket.notes.push({
        auteur: req.user.id,
        texte: `VALIDATION: ${commentaire}`,
        type: "validation",
        date: new Date(),
      });
    await ticket.save();

    await createLog(
      "TICKET_VALIDATED",
      `Clôturé: "${ticket.titre}" par ${managerNom}`,
      req.user.id,
    );

    if (ticket.technicienId) {
      await sendNotification({
        userId: ticket.technicienId._id || ticket.technicienId,
        message: `${managerNom} a validé et clôturé le ticket "${ticket.titre}". Bon travail !`,
        type: "ticket_validated",
        ticketId: ticket._id,
      });
    }

    if (ticket.auteurId) {
      await sendNotification({
        userId: ticket.auteurId,
        message: `Votre ticket "${ticket.titre}" a été validé et clôturé par ${managerNom}.`,
        type: "ticket_validated",
        ticketId: ticket._id,
      });
    }

    const admins = await User.find({ role: "admin", actif: true });
    await Promise.all(
      admins.map((a) =>
        sendNotification({
          userId: a._id,
          message: `Ticket "${ticket.titre}" validé par ${managerNom} (résolu par ${techNom}).`,
          type: "ticket_validated",
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

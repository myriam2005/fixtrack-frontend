// controllers/statsController.js
const Ticket = require("../models/Ticket");
const User = require("../models/User");

const getManagerStats = async (req, res) => {
  try {
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);
    const ticketsByPriority = await Ticket.aggregate([
      { $group: { _id: "$priorite", count: { $sum: 1 } } },
    ]);
    const ticketsByCategory = await Ticket.aggregate([
      { $group: { _id: "$categorie", count: { $sum: 1 } } },
    ]);
    const criticalUnassigned = await Ticket.find({
      priorite: "critical",
      statut: "open",
      technicienId: null,
    })
      .populate("auteurId", "nom email")
      .sort({ createdAt: 1 })
      .limit(10);

    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ statut: "open" });
    const resolvedTickets = await Ticket.countDocuments({
      statut: { $in: ["resolved", "closed"] },
    });

    res.json({
      totalTickets,
      openTickets,
      resolvedTickets,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      criticalUnassigned,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ actif: true });
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const totalTickets = await Ticket.countDocuments();
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);
    const resolved = await Ticket.countDocuments({
      statut: { $in: ["resolved", "closed"] },
    });
    const systemHealth =
      totalTickets > 0 ? Math.round((resolved / totalTickets) * 100) : 100;

    res.json({
      totalUsers,
      usersByRole,
      totalTickets,
      ticketsByStatus,
      systemHealth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTechnicianStats = async (req, res) => {
  try {
    const techId = req.params.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const resolvedThisMonth = await Ticket.countDocuments({
      technicienId: techId,
      statut: { $in: ["resolved", "closed"] },
      updatedAt: { $gte: startOfMonth },
    });
    const activeTickets = await Ticket.countDocuments({
      technicienId: techId,
      statut: { $in: ["assigned", "in_progress"] },
    });

    res.json({ resolvedThisMonth, activeTickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getManagerStats, getAdminStats, getTechnicianStats };

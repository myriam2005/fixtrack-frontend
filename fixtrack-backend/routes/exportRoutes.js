// routes/exportRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

// ── GET /api/export/excel ─────────────────────────────────────────────────────
router.get(
  "/excel",
  auth,
  roleCheck(["manager", "admin"]),
  async (req, res) => {
    try {
      const ExcelJS = require("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "FixTrack";

      // Onglet Tickets
      const ticketSheet = workbook.addWorksheet("Tickets");
      ticketSheet.columns = [
        { header: "Titre", key: "titre", width: 35 },
        { header: "Statut", key: "statut", width: 14 },
        { header: "Priorité", key: "priorite", width: 12 },
        { header: "Catégorie", key: "categorie", width: 16 },
        { header: "Localisation", key: "localisation", width: 28 },
        { header: "Auteur", key: "auteur", width: 20 },
        { header: "Technicien", key: "technicien", width: 20 },
        { header: "Date", key: "date", width: 18 },
      ];
      ticketSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
      ticketSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2563EB" },
      };

      const tickets = await Ticket.find()
        .populate("auteurId", "nom")
        .populate("technicienId", "nom");

      tickets.forEach((t) => {
        ticketSheet.addRow({
          titre: t.titre,
          statut: t.statut,
          priorite: t.priorite,
          categorie: t.categorie,
          localisation: t.localisation,
          auteur: t.auteurId?.nom || "-",
          technicien: t.technicienId?.nom || "Non assigné",
          date: t.createdAt?.toLocaleDateString("fr-FR"),
        });
      });

      // Onglet Utilisateurs
      const userSheet = workbook.addWorksheet("Utilisateurs");
      userSheet.columns = [
        { header: "Nom", key: "nom", width: 22 },
        { header: "Email", key: "email", width: 28 },
        { header: "Rôle", key: "role", width: 14 },
        { header: "Actif", key: "actif", width: 10 },
      ];
      userSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
      userSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2563EB" },
      };

      const users = await User.find().select("-password");
      users.forEach((u) => {
        userSheet.addRow({
          nom: u.nom,
          email: u.email,
          role: u.role,
          actif: u.actif ? "Oui" : "Non",
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=FixTrack_Export_${Date.now()}.xlsx`,
      );
      const buffer = await workbook.xlsx.writeBuffer();
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// ── GET /api/export/pdf ───────────────────────────────────────────────────────
router.get("/pdf", auth, roleCheck(["manager", "admin"]), async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FixTrack_Report_${Date.now()}.pdf`,
    );
    doc.pipe(res);

    doc.fontSize(22).fillColor("#2563EB").text("FixTrack", { align: "center" });
    doc
      .fontSize(14)
      .fillColor("#374151")
      .text("Rapport Mensuel", { align: "center" });
    doc.moveDown(1);

    const totalTickets = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ statut: "open" });
    const resolved = await Ticket.countDocuments({
      statut: { $in: ["resolved", "closed"] },
    });
    const totalUsers = await User.countDocuments({ actif: true });

    doc
      .fontSize(13)
      .fillColor("#111827")
      .text("Résumé KPIs", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#374151");
    doc.text(`• Total tickets : ${totalTickets}`);
    doc.text(`• Tickets ouverts : ${open}`);
    doc.text(`• Tickets résolus : ${resolved}`);
    doc.text(`• Utilisateurs actifs : ${totalUsers}`);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

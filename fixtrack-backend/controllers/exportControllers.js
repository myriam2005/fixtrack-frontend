// controllers/exportController.js
// npm install exceljs pdfkit
const Ticket = require("../models/Ticket");
const User = require("../models/User");

const PRIORITY_LABELS = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};
const STATUS_LABELS = {
  open: "Ouvert",
  assigned: "Assigné",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Clôturé",
};

// ── GET /api/export/excel ─────────────────────────────────────────────────────
exports.exportExcel = async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const [tickets, users] = await Promise.all([
      Ticket.find()
        .populate("auteurId", "nom email")
        .populate("technicienId", "nom email")
        .sort({ createdAt: -1 }),
      User.find().select("-password").sort({ createdAt: -1 }),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = "FixTrack";
    wb.created = new Date();

    // ── Onglet Tickets ────────────────────────────────────────────────────────
    const wsT = wb.addWorksheet("Tickets");
    wsT.columns = [
      { header: "ID", key: "id", width: 26 },
      { header: "Titre", key: "titre", width: 40 },
      { header: "Statut", key: "statut", width: 14 },
      { header: "Priorité", key: "priorite", width: 12 },
      { header: "Catégorie", key: "categorie", width: 16 },
      { header: "Localisation", key: "localisation", width: 30 },
      { header: "Employé", key: "auteur", width: 22 },
      { header: "Technicien", key: "technicien", width: 22 },
      { header: "Date création", key: "dateCreation", width: 20 },
    ];

    // Style en-tête
    wsT.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 11 };
      cell.border = { bottom: { style: "thin", color: { argb: "FF1D4ED8" } } };
    });

    tickets.forEach((t, i) => {
      const row = wsT.addRow({
        id: t._id.toString(),
        titre: t.titre,
        statut: STATUS_LABELS[t.statut] || t.statut,
        priorite: PRIORITY_LABELS[t.priorite] || t.priorite,
        categorie: t.categorie,
        localisation: t.localisation,
        auteur: t.auteurId?.nom || "—",
        technicien: t.technicienId?.nom || "Non assigné",
        dateCreation: t.createdAt
          ? new Date(t.createdAt).toLocaleDateString("fr-FR")
          : "—",
      });
      if (i % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEFF6FF" },
          };
        });
      }
    });

    // ── Onglet Utilisateurs ───────────────────────────────────────────────────
    const wsU = wb.addWorksheet("Utilisateurs");
    wsU.columns = [
      { header: "ID", key: "id", width: 26 },
      { header: "Nom", key: "nom", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Rôle", key: "role", width: 16 },
      { header: "Statut", key: "actif", width: 12 },
      { header: "Date création", key: "createdAt", width: 20 },
    ];
    wsU.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1D4ED8" },
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    });
    users.forEach((u) => {
      wsU.addRow({
        id: u._id.toString(),
        nom: u.nom,
        email: u.email,
        role: u.role,
        actif: u.actif !== false ? "Actif" : "Inactif",
        createdAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("fr-FR")
          : "—",
      });
    });

    // ── Onglet Statistiques ───────────────────────────────────────────────────
    const wsS = wb.addWorksheet("Statistiques");
    const byStatus = {};
    const byPriority = {};
    tickets.forEach((t) => {
      byStatus[t.statut] = (byStatus[t.statut] || 0) + 1;
      byPriority[t.priorite] = (byPriority[t.priorite] || 0) + 1;
    });
    wsS.addRow([
      "Rapport FixTrack — " + new Date().toLocaleDateString("fr-FR"),
    ]);
    wsS.addRow([]);
    wsS.addRow(["Par statut"]);
    Object.entries(byStatus).forEach(([k, v]) =>
      wsS.addRow([STATUS_LABELS[k] || k, v]),
    );
    wsS.addRow([]);
    wsS.addRow(["Par priorité"]);
    Object.entries(byPriority).forEach(([k, v]) =>
      wsS.addRow([PRIORITY_LABELS[k] || k, v]),
    );

    // Envoyer
    const filename = `FixTrack_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export Excel:", err);
    res
      .status(500)
      .json({ message: "Erreur export Excel", error: err.message });
  }
};

// ── GET /api/export/pdf ───────────────────────────────────────────────────────
exports.exportPdf = async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const [tickets, users] = await Promise.all([
      Ticket.find()
        .populate("auteurId", "nom")
        .populate("technicienId", "nom")
        .sort({ createdAt: -1 })
        .limit(100),
      User.find().select("-password"),
    ]);

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      layout: "landscape",
    });
    const filename = `FixTrack_Rapport_${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // ── En-tête ───────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 60).fill("#1E3A5F");
    doc
      .fillColor("#FFFFFF")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("FixTrack — Rapport de maintenance", 40, 18);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`,
        40,
        44,
      );

    doc.moveDown(2);

    // ── KPIs ──────────────────────────────────────────────────────────────────
    const open = tickets.filter((t) => t.statut === "open").length;
    const progress = tickets.filter((t) =>
      ["assigned", "in_progress"].includes(t.statut),
    ).length;
    const resolved = tickets.filter((t) =>
      ["resolved", "closed"].includes(t.statut),
    ).length;
    const rate =
      tickets.length > 0 ? Math.round((resolved / tickets.length) * 100) : 0;

    doc
      .fillColor("#1E3A5F")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Vue d'ensemble", 40, 75);

    const kpis = [
      { label: "Total tickets", value: tickets.length, color: "#2563EB" },
      { label: "Ouverts", value: open, color: "#EF4444" },
      { label: "En traitement", value: progress, color: "#F59E0B" },
      { label: "Taux résolution", value: `${rate}%`, color: "#22C55E" },
      { label: "Utilisateurs", value: users.length, color: "#7C3AED" },
    ];

    let kpiX = 40;
    kpis.forEach((kpi) => {
      doc
        .rect(kpiX, 92, 130, 52)
        .fill(kpi.color + "18")
        .stroke(kpi.color + "44");
      doc
        .fillColor(kpi.color)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(String(kpi.value), kpiX + 10, 98);
      doc
        .fillColor("#6B7280")
        .fontSize(9)
        .font("Helvetica")
        .text(kpi.label, kpiX + 10, 122);
      kpiX += 144;
    });

    doc.moveDown(5);

    // ── Tableau tickets ───────────────────────────────────────────────────────
    doc
      .fillColor("#1E3A5F")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Détail des tickets", 40, 160);

    const headers = [
      "ID",
      "Titre",
      "Statut",
      "Priorité",
      "Catégorie",
      "Technicien",
      "Date",
    ];
    const colW = [60, 175, 70, 65, 75, 90, 70];
    let tableX = 40;
    let tableY = 178;

    // En-tête tableau
    doc
      .rect(tableX, tableY, colW.reduce((a, b) => a + b, 0) + 12, 20)
      .fill("#2563EB");
    let cx = tableX + 4;
    headers.forEach((h, i) => {
      doc
        .fillColor("#FFFFFF")
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .text(h, cx, tableY + 6, { width: colW[i], ellipsis: true });
      cx += colW[i];
    });
    tableY += 20;

    // Lignes
    tickets.slice(0, 45).forEach((t, idx) => {
      if (tableY > doc.page.height - 60) {
        doc.addPage({ layout: "landscape" });
        tableY = 40;
      }
      const bg = idx % 2 === 0 ? "#EFF6FF" : "#FFFFFF";
      const rowH = 16;
      const rowW = colW.reduce((a, b) => a + b, 0) + 12;
      doc.rect(tableX, tableY, rowW, rowH).fill(bg);

      const cells = [
        t._id.toString().slice(-8).toUpperCase(),
        t.titre,
        STATUS_LABELS[t.statut] || t.statut,
        PRIORITY_LABELS[t.priorite] || t.priorite,
        t.categorie,
        t.technicienId?.nom || "Non assigné",
        t.createdAt ? new Date(t.createdAt).toLocaleDateString("fr-FR") : "—",
      ];

      cx = tableX + 4;
      cells.forEach((cell, i) => {
        doc
          .fillColor("#374151")
          .fontSize(7.5)
          .font("Helvetica")
          .text(String(cell), cx, tableY + 5, {
            width: colW[i] - 2,
            ellipsis: true,
          });
        cx += colW[i];
      });
      tableY += rowH;
    });

    if (tickets.length > 45) {
      doc
        .moveDown()
        .fillColor("#6B7280")
        .fontSize(9)
        .text(
          `... et ${tickets.length - 45} tickets supplémentaires (export Excel pour liste complète)`,
        );
    }

    doc.end();
  } catch (err) {
    console.error("Export PDF:", err);
    res.status(500).json({ message: "Erreur export PDF", error: err.message });
  }
};

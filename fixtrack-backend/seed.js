// seed.js  — Peuple la BDD avec les données de mockData.js
// Usage : node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/database");

const User = require("./models/User");
const Ticket = require("./models/Ticket");
const Notification = require("./models/Notification");

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Ticket.deleteMany({});
  await Notification.deleteMany({});
  console.log("🗑️  Collections nettoyées");

  const users = await User.create([
    {
      nom: "oumayma",
      email: "oumayma.jendoubi06@gmail.com",
      password: "123456",
      role: "user",
      avatar: "OJ",
      telephone: "+216 22 111 222",
      emailVerified: true,
    },
    {
      nom: "ola",
      email: "olakhammassy@gmail.com",
      password: "123456",
      role: "technician",
      avatar: "OK",
      competences: ["Électrique", "HVAC"],
      emailVerified: true,
    },
    {
      nom: "emen",
      email: "emenhm123@gmail.com",
      password: "123456",
      role: "technician",
      avatar: "EH",
      competences: ["Informatique", "Mécanique"],
      emailVerified: true,
    },
    {
      nom: "chokri",
      email: "maryemchaker@gmail.com",
      password: "123456",
      role: "manager",
      avatar: "MC",
      emailVerified: true,
    },
    {
      nom: "Admin FST",
      email: "myriemkary3@gmail.com",
      password: "123456",
      role: "admin",
      avatar: "AF",
      emailVerified: true,
    },
  ]);

  const u = {};
  users.forEach((user) => {
    if (user.email === "oumayma.jendoubi06@gmail.com") u.u1 = user._id;
    if (user.email === "olakhammassy@gmail.com") u.u2 = user._id;
    if (user.email === "emenhm123@gmail.com") u.u3 = user._id;
    if (user.email === "maryemchaker@gmail.com") u.u4 = user._id;
    if (user.email === "myriemkary3@gmail.com") u.u5 = user._id;
  });

  console.log("✅ Utilisateurs créés :", users.length);

  const tickets = await Ticket.create([
    {
      titre: "Climatisation en panne salle B12",
      description:
        "La climatisation ne fonctionne plus depuis ce matin, il fait très chaud.",
      statut: "open",
      priorite: "critical",
      categorie: "HVAC",
      localisation: "Bâtiment B — Salle 12",
      auteurId: u.u1,
      auteurTel: "+216 22 111 222",
      technicienId: null,
    },
    {
      titre: "Projecteur qui scintille en cours",
      description: "Le projecteur de l'amphi clignote pendant les cours.",
      statut: "assigned",
      priorite: "high",
      categorie: "Électrique",
      localisation: "Amphithéâtre 1",
      auteurId: u.u1,
      technicienId: u.u2,
    },
    {
      titre: "Imprimante bloquée — bourrage papier",
      description: "Bourrage papier impossible à débloquer manuellement.",
      statut: "in_progress",
      priorite: "medium",
      categorie: "Informatique",
      localisation: "Bâtiment C — Bureau Scolarité",
      auteurId: u.u1,
      auteurTel: "+216 55 000 111",
      technicienId: u.u3,
      notes: [
        {
          auteur: u.u3,
          texte: "Pièce commandée, livraison prévue demain.",
          type: "note",
        },
      ],
    },
    {
      titre: "Serveur très lent — salle informatique",
      description: "Le serveur de la salle info est extrêmement lent.",
      statut: "resolved",
      priorite: "high",
      categorie: "Informatique",
      localisation: "Bâtiment A — Salle Informatique",
      auteurId: u.u1,
      technicienId: u.u3,
      notes: [
        {
          auteur: u.u3,
          texte: "RAM nettoyée, performances revenues à la normale.",
          type: "solution",
        },
      ],
    },
    {
      titre: "Bruit anormal dans la chaudière",
      description:
        "Un bruit de frottement inhabituel provient de la chaudière du sous-sol.",
      statut: "closed",
      priorite: "low",
      categorie: "Mécanique",
      localisation: "Sous-sol — Local technique",
      auteurId: u.u1,
      technicienId: u.u2,
      notes: [
        {
          auteur: u.u2,
          texte: "Vis de fixation resserrées, problème résolu.",
          type: "solution",
        },
      ],
    },
    {
      titre: "Fuite d'eau au plafond",
      description:
        "Une infiltration d'eau est visible au plafond des toilettes du RDC.",
      statut: "open",
      priorite: "critical",
      categorie: "Plomberie",
      localisation: "Bâtiment A — Toilettes RDC",
      auteurId: u.u1,
      auteurTel: "+216 22 333 444",
      technicienId: null,
    },
    {
      titre: "Serrure de porte cassée",
      description:
        "La serrure de la salle de réunion ne ferme plus correctement.",
      statut: "assigned",
      priorite: "medium",
      categorie: "Sécurité",
      localisation: "Bâtiment B — Salle de réunion",
      auteurId: u.u1,
      technicienId: u.u2,
    },
    {
      titre: "Ampoules grillées — couloir",
      description:
        "Plusieurs ampoules sont grillées dans le couloir du 2e étage.",
      statut: "in_progress",
      priorite: "low",
      categorie: "Électrique",
      localisation: "Bâtiment C — Couloir Étage 2",
      auteurId: u.u1,
      technicienId: u.u2,
      notes: [{ auteur: u.u2, texte: "Ampoules commandées.", type: "note" }],
    },
  ]);

  console.log("✅ Tickets créés :", tickets.length);

  await Notification.create([
    {
      userId: u.u2,
      message: "Nouveau ticket assigné : Projecteur qui scintille en cours",
      type: "ticket_assigned",
      lu: false,
      ticketId: tickets[1]._id,
    },
    {
      userId: u.u1,
      message: "Votre ticket 'Imprimante bloquée' est en cours de traitement",
      type: "status_changed",
      lu: false,
      ticketId: tickets[2]._id,
    },
    {
      userId: u.u4,
      message: "Ticket 'Serveur très lent' résolu — en attente de validation",
      type: "ticket_resolved",
      lu: true,
      ticketId: tickets[3]._id,
    },
    {
      userId: u.u2,
      message: "Nouveau ticket assigné : Serrure de porte cassée",
      type: "ticket_assigned",
      lu: false,
      ticketId: tickets[6]._id,
    },
    {
      userId: u.u4,
      message: "Ticket critique ouvert : Fuite d'eau au plafond",
      type: "ticket_critical",
      lu: false,
      ticketId: tickets[5]._id,
    },
  ]);

  console.log("✅ Notifications créées");

  console.log("\n Base de données peuplée avec succès !");
  console.log("\n Comptes disponibles (mot de passe : 123456) :");
  console.log("   user       → oumayma.jendoubi06@gmail.com");
  console.log("   technician → olakhammassy@gmail.com  |  emenhm123@gmail.com");
  console.log("   manager    → maryemchaker@gmail.com");
  console.log("   admin      → myriemkary3@gmail.com");

  mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Erreur seed:", err);
  mongoose.disconnect();
});

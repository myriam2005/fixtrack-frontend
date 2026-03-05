// src/data/mockData.js

// ─── UTILISATEURS ─────────────────────────────────────────
export const users = [
  { id: "u1", nom: "Jean Dupont",   email: "jean@fst.tn",  password: "123456",       role: "employee",   avatar: "JD", telephone: "+216 22 111 222", statut: "actif", dateCreation: "2025-01-10" },
  { id: "u2", nom: "Sara Ben Ali",  email: "sara@fst.tn",  password: "Fixtrack2025", role: "technician", avatar: "SB", competences: ["Électrique", "HVAC"],        statut: "actif", dateCreation: "2025-01-08" },
  { id: "u3", nom: "Karim Maaloul", email: "karim@fst.tn", password: "123456",       role: "technician", avatar: "KM", competences: ["Informatique", "Mécanique"], statut: "actif", dateCreation: "2025-01-07" },
  { id: "u4", nom: "Lina Trabelsi", email: "lina@fst.tn",  password: "123456",       role: "manager",    avatar: "LT", statut: "actif", dateCreation: "2025-01-05" },
  { id: "u5", nom: "Admin FST",     email: "admin@fst.tn", password: "123456",       role: "admin",      avatar: "AF", statut: "actif", dateCreation: "2025-01-01" },
];

// ─── TICKETS ──────────────────────────────────────────────
export const tickets = [
  { id:"t1",  titre:"Climatisation en panne salle B12",    description:"La climatisation ne fonctionne plus depuis ce matin, température insupportable.", statut:"open",        priorite:"critical", categorie:"HVAC",        localisation:"Bâtiment B — Salle 12",          auteurId:"u1", auteurTel:"+216 22 111 222", technicienId:null, dateCreation:"2025-01-15", notes:[] },
  { id:"t2",  titre:"Projecteur qui scintille en cours",   description:"Le projecteur de l'amphi clignote pendant les cours, perturbant étudiants et enseignants.", statut:"assigned",    priorite:"high",     categorie:"Électrique",  localisation:"Amphithéâtre 1",                 auteurId:"u1", auteurTel:null,             technicienId:"u2", dateCreation:"2025-01-14", notes:[] },
  { id:"t3", titre:"Imprimante bloquée — test",           description:"Test.",                                                                                      statut:"assigned",    priorite:"medium",   categorie:"Informatique", localisation:"Bâtiment C — Bureau Scolarité", auteurId:"u1", auteurTel:"+216 55 000 111",technicienId:"u3", dateCreation:"2025-01-13", notes:["Pièce commandée."] },
  { id:"t4",  titre:"Imprimante bloquée — bourrage papier",description:"Bourrage papier impossible à débloquer manuellement.",                                       statut:"in_progress", priorite:"medium",   categorie:"Informatique", localisation:"Bâtiment C — Bureau Scolarité", auteurId:"u1", auteurTel:"+216 55 000 111",technicienId:"u3", dateCreation:"2025-01-13", notes:["Pièce commandée, livraison prévue demain."] },
  { id:"t5",  titre:"Serveur très lent — salle informatique", description:"Le serveur est extrêmement lent, les étudiants ne peuvent pas travailler.", statut:"resolved",    priorite:"high",     categorie:"Informatique", localisation:"Bâtiment A — Salle Informatique",auteurId:"u1", auteurTel:null,             technicienId:"u3", dateCreation:"2025-01-10", notes:["RAM nettoyée, performances revenues à la normale."] },
  { id:"t6",  titre:"Bruit anormal dans la chaudière",     description:"Un bruit de frottement inhabituel provient de la chaudière du sous-sol.",             statut:"closed",      priorite:"low",      categorie:"Mécanique",   localisation:"Sous-sol — Local technique",     auteurId:"u1", auteurTel:null,             technicienId:"u2", dateCreation:"2025-01-08", notes:["Vis de fixation resserrées, problème résolu."] },
  { id:"t7",  titre:"Fuite d'eau au plafond",              description:"Infiltration d'eau visible au plafond des toilettes RDC. Sol glissant, risque de chute.", statut:"open",        priorite:"critical", categorie:"Plomberie",   localisation:"Bâtiment A — Toilettes RDC",     auteurId:"u1", auteurTel:"+216 22 333 444",technicienId:null, dateCreation:"2025-01-16", notes:[] },
  { id:"t8",  titre:"Serrure de porte cassée",             description:"La serrure de la salle de réunion ne ferme plus correctement.",                          statut:"assigned",    priorite:"medium",   categorie:"Sécurité",    localisation:"Bâtiment B — Salle de réunion", auteurId:"u1", auteurTel:null,             technicienId:"u2", dateCreation:"2025-01-15", notes:[] },
  { id:"t9",  titre:"Ampoules grillées — couloir",         description:"Plusieurs ampoules grillées dans le couloir du 2e étage, éclairage insuffisant.",        statut:"in_progress", priorite:"low",      categorie:"Électrique",  localisation:"Bâtiment C — Couloir Étage 2",  auteurId:"u1", auteurTel:null,             technicienId:"u2", dateCreation:"2025-01-12", notes:["Ampoules commandées."] },
];

// ─── RÈGLES DE NOTIFICATION PAR RÔLE ─────────────────────────────────────────
//
//  EMPLOYEE   → reçoit notif quand SON ticket change de statut (résolu, fermé, en cours, assigné)
//  TECHNICIAN → reçoit notif quand un ticket lui est assigné ou réassigné
//  MANAGER    → reçoit notif quand un ticket est créé, résolu (validation requise), critique
//  ADMIN      → reçoit notif quand un ticket est créé, assigné/réassigné, critique
//
// Chaque notif a : { id, message, type, lu, timestamp, forUserId, ticketId, event }
// forUserId : à qui appartient cette notif (filtrage côté contexte selon user connecté)
// event     : 'ticket_created' | 'ticket_assigned' | 'ticket_reassigned' |
//             'ticket_resolved' | 'ticket_closed' | 'ticket_in_progress' | 'ticket_critical'

export const mockNotifications = [

  // ── EMPLOYEE u1 : son ticket t4 a été résolu ──────────────────────────────
  {
    id: "mn1",
    message: "Votre ticket 'Serveur très lent' a été résolu par Karim Maaloul.",
    type: "success",
    lu: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    forUserId: "u1",
    ticketId: "t4",
    event: "ticket_resolved",
  },

  // ── EMPLOYEE u1 : son ticket t3 est passé en cours ────────────────────────
  {
    id: "mn2",
    message: "Votre ticket 'Imprimante bloquée' est maintenant pris en charge.",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    forUserId: "u1",
    ticketId: "t3",
    event: "ticket_in_progress",
  },

  // ── TECHNICIAN u2 : assigné au ticket t2 ──────────────────────────────────
  {
    id: "mn3",
    message: "Vous avez été assigné au ticket 'Projecteur qui scintille en cours' — Amphithéâtre 1.",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    forUserId: "u2",
    ticketId: "t2",
    event: "ticket_assigned",
  },

  // ── TECHNICIAN u2 : réassigné au ticket t7 ────────────────────────────────
  {
    id: "mn4",
    message: "Vous avez été réassigné au ticket 'Serrure de porte cassée' — Bâtiment B.",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    forUserId: "u2",
    ticketId: "t7",
    event: "ticket_reassigned",
  },

  // ── TECHNICIAN u3 : assigné au ticket t3 ──────────────────────────────────
  {
    id: "mn5",
    message: "Vous avez été assigné au ticket 'Imprimante bloquée — bourrage papier' — Bureau Scolarité.",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    forUserId: "u3",
    ticketId: "t3",
    event: "ticket_assigned",
  },

  // ── MANAGER u4 : nouveau ticket créé (t1) ─────────────────────────────────
  {
    id: "mn6",
    message: "Nouveau ticket créé : 'Climatisation en panne salle B12' par Jean Dupont.",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    forUserId: "u4",
    ticketId: "t1",
    event: "ticket_created",
  },

  // ── MANAGER u4 : ticket critique t6 ──────────────────────────────────────
  {
    id: "mn7",
    message: "Ticket CRITIQUE : 'Fuite d'eau au plafond' — intervention urgente requise.",
    type: "warning",
    lu: false,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    forUserId: "u4",
    ticketId: "t6",
    event: "ticket_critical",
  },

  // ── MANAGER u4 : ticket t4 résolu, validation requise ─────────────────────
  {
    id: "mn8",
    message: "Ticket résolu en attente de validation : 'Serveur très lent' — veuillez confirmer.",
    type: "success",
    lu: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    forUserId: "u4",
    ticketId: "t4",
    event: "ticket_resolved",
  },

  // ── ADMIN u5 : nouveau ticket créé (t6) ───────────────────────────────────
  {
    id: "mn9",
    message: "Nouveau ticket créé : 'Fuite d'eau au plafond' par Jean Dupont — priorité CRITIQUE.",
    type: "warning",
    lu: false,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    forUserId: "u5",
    ticketId: "t6",
    event: "ticket_created",
  },

  // ── ADMIN u5 : ticket t2 assigné ──────────────────────────────────────────
  {
    id: "mn10",
    message: "Ticket assigné : 'Projecteur qui scintille en cours' → Sara Ben Ali.",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    forUserId: "u5",
    ticketId: "t2",
    event: "ticket_assigned",
  },

  // ── ADMIN u5 : ticket t7 réassigné ────────────────────────────────────────
  {
    id: "mn11",
    message: "Ticket réassigné : 'Serrure de porte cassée' → Sara Ben Ali (changement de technicien).",
    type: "info",
    lu: false,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    forUserId: "u5",
    ticketId: "t7",
    event: "ticket_reassigned",
  },
];
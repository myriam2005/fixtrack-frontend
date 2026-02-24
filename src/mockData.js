export const users = [
  { id: "u1", nom: "Jean Dupont", email: "jean@fst.tn", role: "employee", avatar: "JD" }
];

export const machines = [
  { id: "m1", nom: "Climatiseur B12", localisation: "Batiment B, Salle 12", categorie: "HVAC", statut: "en_panne" }
];

export const tickets = [
  {
    id: "t1",
    titre: "Clim en panne salle B12",
    description: "La climatisation ne fonctionne plus.",
    statut: "open",
    priorite: "high",
    machineId: "m1",
    auteurId: "u1",
    technicienId: null,
    dateCreation: "2025-01-15",
    notes: []
  }
];
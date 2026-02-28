import { useState, useMemo } from "react";
import { tickets, users } from "../../data/mockData";
import Badge          from "../../components/common/Badge";
import Button         from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";



const STATUT_CONFIG = {
  open: { label: "Ouvert", variant: "error" },
  assigned: { label: "Assigné", variant: "warning" },
  in_progress: { label: "En cours", variant: "info" },
  resolved: { label: "Résolu", variant: "success" },
  closed: { label: "Clôturé", variant: "secondary" },
};

const PRIORITE_CONFIG = {
  critical: { label: "Critique", variant: "error" },
  high: { label: "Haute", variant: "warning" },
  medium: { label: "Moyenne", variant: "info" },
  low: { label: "Basse", variant: "secondary" },
};

const FILTRES_STATUT = [
  { key: "all", label: "Tous" },
  { key: "open", label: "Ouvert" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved", label: "Résolu" },
];

const FILTRES_PRIORITE = [
  { key: "critical", label: "Critique" },
  { key: "high", label: "Haute" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function MesTickets() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); 
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("all");
  const [filtrePriorite, setFiltrePriorite] = useState(null);

    
  // Gestion du chargement
  if (loading) {
    return <LoadingSpinner />; // Ou un div de chargement
  }

  // Gestion de l'absence d'utilisateur
  if (!user) {
    return <div>Veuillez vous connecter</div>;
  }

  
  const mesTickets = useMemo(
    () => tickets.filter((t) => t.auteurId === "u1"),
    [user?.id, tickets] 
  );


  const ticketsFiltres = useMemo(() => {
    return mesTickets.filter((ticket) => {
      const matchRecherche =
        !recherche ||
        ticket.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        ticket.id.toLowerCase().includes(recherche.toLowerCase()) ||
        ticket.categorie?.toLowerCase().includes(recherche.toLowerCase());

      const matchStatut =
        filtreStatut === "all" || ticket.statut === filtreStatut;

      const matchPriorite =
        !filtrePriorite || ticket.priorite === filtrePriorite;

      return matchRecherche && matchStatut && matchPriorite;
    });
  }, [mesTickets, recherche, filtreStatut, filtrePriorite]);

  const handleFiltrePriorite = (key) => {
    setFiltrePriorite((prev) => (prev === key ? null : key));
  };

  return (
    <div className="wz-page">
      <style>{`
        .mes-tickets-container {
          padding: 2rem;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          min-height: 100vh;
          font-family: 'Sora', 'Segoe UI', sans-serif;
        }

        /* ── Animations ── */
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* En-tête */
        .mt-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          animation: fadeSlideDown 0.55s ease both;
        }
        .mt-header h1 {
          font-size: 1.85rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(270deg, #6366f1, #8b5cf6, #52434a, #3b3223, #06b5d465, #6366f1);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 100s ease infinite;
          letter-spacing: -0.02em;
        }
        .mt-compteur {
          font-size: 0.875rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
          font-weight: 500;
        }

        /* Barre de recherche */
        .mt-search-bar {
          position: relative;
          margin-bottom: 1rem;
          animation: fadeSlideUp 0.5s 0.15s ease both;
        }
        .mt-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .mt-search-bar input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #374151;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .mt-search-bar input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        /* Filtres */
        .mt-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          animation: fadeSlideUp 0.5s 0.25s ease both;
        }
        .mt-filter-btn {
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          font-size: 0.82rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .mt-filter-btn:hover {
          border-color: #6366f1;
          color: #6366f1;
        }
        .mt-filter-btn.active {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
        }
        .mt-filter-btn.active-critical {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
        }
        .mt-filter-btn.active-high {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #fff;
        }
        .mt-filter-sep {
          width: 1px;
          height: 20px;
          background: #e5e7eb;
          margin: 0 0.25rem;
        }

        /* Tableau */
        .mt-table-wrapper {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          animation: fadeSlideUp 0.5s 0.35s ease both;
        }
        .mt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .mt-table thead {
          background: #f9fafb;
        }
        .mt-table thead th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        .mt-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
          animation: rowIn 0.3s ease both;
        }
        .mt-table tbody tr:nth-child(1) { animation-delay: 0.05s; }
        .mt-table tbody tr:nth-child(2) { animation-delay: 0.1s; }
        .mt-table tbody tr:nth-child(3) { animation-delay: 0.15s; }
        .mt-table tbody tr:nth-child(4) { animation-delay: 0.2s; }
        .mt-table tbody tr:nth-child(5) { animation-delay: 0.25s; }
        .mt-table tbody tr:nth-child(6) { animation-delay: 0.3s; }
        .mt-table tbody tr:nth-child(7) { animation-delay: 0.35s; }
        .mt-table tbody tr:nth-child(8) { animation-delay: 0.4s; }
        .mt-table tbody tr:last-child {
          border-bottom: none;
        }
        .mt-table tbody tr:hover {
          background: #f9fafb;
        }
        .mt-table td {
          padding: 0.85rem 1rem;
          color: #374151;
          vertical-align: middle;
        }
        .mt-ticket-id {
          font-family: 'JetBrains Mono', 'Fira Mono', monospace;
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }
        .mt-ticket-titre {
          font-weight: 600;
          color: #6366f1;
          max-width: 260px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .mt-ticket-localisation {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.73rem;
          color: #9ca3af;
          margin-top: 0.18rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 260px;
        }
        .mt-technicien {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .mt-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #e0e7ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .mt-date {
          color: #6b7280;
          font-size: 0.82rem;
          white-space: nowrap;
        }
        .mt-empty-cell {
          color: #9ca3af;
        }

        /* État vide */
        .mt-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #9ca3af;
        }
        .mt-empty p {
          margin: 0.5rem 0 0;
          font-size: 0.9rem;
        }

        /* Bouton flottant */
        .mt-fab-wrapper {
          position: fixed;
          bottom: 4rem;
          right: 2rem;
          z-index: 50;
          filter: drop-shadow(0 4px 12px rgba(99,102,241,0.35));
        }

        @media (max-width: 768px) {
          .mes-tickets-container { padding: 1rem; }
          .mt-table thead th:nth-child(4),
          .mt-table td:nth-child(4),
          .mt-table thead th:nth-child(6),
          .mt-table td:nth-child(6) { display: none; }
          .mt-ticket-titre { max-width: 140px; }
        }
      `}</style>

      <div className="mes-tickets-container">
        {/* En-tête */}
        <div className="mt-header">
          <h1>Mes tickets</h1>
          <span className="mt-compteur">{mesTickets.length} ticket(s) total</span>
        </div>

        {/* Barre de recherche */}
        <div className="mt-search-bar">
          <span className="mt-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        {/* Filtres */}
        <div className="mt-filters">
          {FILTRES_STATUT.map((f) => (
            <button
              key={f.key}
              className={`mt-filter-btn${filtreStatut === f.key ? " active" : ""}`}
              onClick={() => setFiltreStatut(f.key)}
            >
              {f.label}
            </button>
          ))}

          <div className="mt-filter-sep" />

          {FILTRES_PRIORITE.map((f) => (
            <button
              key={f.key}
              className={`mt-filter-btn${filtrePriorite === f.key ? ` active-${f.key}` : ""}`}
              onClick={() => handleFiltrePriorite(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="mt-table-wrapper">
          <table className="mt-table">
            <thead>
              <tr>
                <th>Priorité</th>
                <th>ID</th>
                <th>Titre</th>
                <th>Criticité</th>
                <th>Statut</th>
                <th>Technicien</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="mt-empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Aucun ticket trouvé</p>
                    </div>
                    
                  </td>
                </tr>
                
              ) : (
                ticketsFiltres.map((ticket) => {
                  const prioriteCfg = PRIORITE_CONFIG[ticket.priorite] || {};
                  const statutCfg = STATUT_CONFIG[ticket.statut] || {};
                  const technicien = users.find((u) => u.id === ticket.technicienId);

                  return (
                    <tr key={ticket.id}>
                      {/* Priorité */}
                      <td>
                        <Badge status={ticket.priorite}>
                          {prioriteCfg.label}
                        </Badge>
                      </td>

                      {/* ID */}
                      <td>
                        <span className="mt-ticket-id">#{ticket.id}</span>
                      </td>

                      {/* Titre */}
                      <td>
                        <span className="mt-ticket-titre" title={ticket.titre}>
                          {ticket.titre}
                        </span>
                        {ticket.localisation && (
                          <span className="mt-ticket-localisation">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {ticket.localisation}
                          </span>
                        )}
                      </td>

                      {/* Criticité (catégorie) */}
                      <td>
                        <Badge status={ticket.categorie}>
                          {prioriteCfg.label}
                        </Badge>
                      </td>
                      

                      {/* Statut */}
                      <td>
                        <Badge status={ticket.statut}>
                          {statutCfg.label}
                        </Badge>
                      </td>

                      {/* Technicien */}
                      <td>
                        {technicien ? (
                          <div className="mt-technicien">
                            <div className="mt-avatar">{technicien.avatar}</div>
                            <span>{technicien.nom}</span>
                          </div>
                        ) : (
                          <span className="mt-empty-cell">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td>
                        <span className="mt-date">{formatDate(ticket.dateCreation)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  );
}

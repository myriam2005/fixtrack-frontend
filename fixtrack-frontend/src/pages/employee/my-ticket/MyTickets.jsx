// src/pages/employee/MyTickets.jsx
import { useState } from "react";
import styles from "./MyTickets.module.css";
import Badge from "../../../components/common/Badge";
import { TOKENS, LABELS } from "../../../components/common/BadgeConstants";
import { tickets, users } from "../../../data/mockData";
import { useAuth } from "../../../context/AuthContext";
import DetailTicket from "../DetailsTickets"; // ✅ import du modal

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUT_KEYS   = ["open", "assigned", "in_progress", "resolved", "closed"];
const PRIORITE_KEYS = ["critical", "high", "medium", "low"];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconPin = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconAlert = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconEmpty = () => (
  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── Toggle helper ────────────────────────────────────────────────────────────
const toggle = (arr, setArr, val) =>
  setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyTickets() {
  const { user } = useAuth();

  const mesTickets = user ? tickets.filter((t) => t.auteurId === user.id) : [];

  const [search,      setSearch]      = useState("");
  const [statuts,     setStatuts]     = useState([]);
  const [priorites,   setPriorites]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [selectedId,  setSelectedId]  = useState(null); // ✅ ID du ticket sélectionné

  const q = search.toLowerCase();
  const filtered = mesTickets.filter((t) => {
    const matchSearch =
      !q ||
      t.titre.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.categorie?.toLowerCase().includes(q) ||
      t.localisation?.toLowerCase().includes(q);
    const matchStatut    = statuts.length === 0    || statuts.includes(t.statut);
    const matchPriorite  = priorites.length === 0  || priorites.includes(t.priorite);
    const matchCategorie = categories.length === 0 || categories.includes(t.categorie);
    return matchSearch && matchStatut && matchPriorite && matchCategorie;
  });

  const hasFilters = statuts.length > 0 || priorites.length > 0 || categories.length > 0 || !!search;
  const clearAll   = () => { setSearch(""); setStatuts([]); setPriorites([]); setCategories([]); };

  const activeTags = [
    ...statuts.map((s)    => ({ key: `s-${s}`, label: LABELS[s],   remove: () => toggle(statuts,    setStatuts,    s) })),
    ...priorites.map((p)  => ({ key: `p-${p}`, label: LABELS[p],   remove: () => toggle(priorites,  setPriorites,  p) })),
    ...categories.map((c) => ({ key: `c-${c}`, label: c,           remove: () => toggle(categories, setCategories, c) })),
    ...(search ? [{ key: "q", label: `"${search}"`, remove: () => setSearch("") }] : []),
  ];

  return (
    <div className={styles.root}>

      {/* ── Modal DetailTicket ── */}
      {selectedId && (
        <DetailTicket
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageEyebrow}>Mes tickets</span>
          <h1 className={styles.pageTitle}>Gestion des tickets</h1>
          <p className={styles.pageSubtitle}>{mesTickets.length} ticket{mesTickets.length !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* ── Filter panel ── */}
      <div className={styles.filterPanel}>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><IconSearch /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Rechercher par titre, ID, catégorie, localisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className={styles.filterGroups}>
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupLabel}><IconClock /> Statut</div>
            <div className={styles.filterChips}>
              {STATUT_KEYS.map((k) => (
                <button
                  key={k}
                  className={`${styles.chip}${statuts.includes(k) ? ` ${styles.active}` : ""}`}
                  style={{ "--chip-color": TOKENS[k]?.dot ?? "#2563EB", "--chip-bg": TOKENS[k]?.bg ?? "#EFF6FF" }}
                  onClick={() => toggle(statuts, setStatuts, k)}
                >
                  {LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterGroupLabel}><IconAlert /> Priorité</div>
            <div className={styles.filterChips}>
              {PRIORITE_KEYS.map((k) => (
                <button
                  key={k}
                  className={`${styles.chip}${priorites.includes(k) ? ` ${styles.active}` : ""}`}
                  style={{ "--chip-color": TOKENS[k]?.dot, "--chip-bg": TOKENS[k]?.bg }}
                  onClick={() => toggle(priorites, setPriorites, k)}
                >
                  <span
                    className={`${styles.chipDot}${k === "critical" ? ` ${styles.pulseDot}` : ""}`}
                    style={{ background: TOKENS[k]?.dot }}
                  />
                  {LABELS[k]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTags.length > 0 && (
          <div className={styles.activeSummary}>
            <span className={styles.activeLabel}>Filtres actifs :</span>
            {activeTags.map((t) => (
              <span key={t.key} className={styles.activeTag}>
                {t.label}
                <button className={styles.activeTagRemove} onClick={t.remove}>✕</button>
              </span>
            ))}
            <button className={styles.clearAll} onClick={clearAll}>Tout effacer</button>
          </div>
        )}
      </div>

      {/* ── Results bar ── */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsText}>
          <strong>{filtered.length}</strong> ticket{filtered.length !== 1 ? "s" : ""}
          {filtered.length !== mesTickets.length && ` sur ${mesTickets.length}`}
        </span>
      </div>

      {/* ── Desktop Table ── */}
      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <IconEmpty />
            <div className={styles.emptyTitle}>Aucun ticket trouvé</div>
            <div className={styles.emptySub}>
              {hasFilters ? "Essayez d'ajuster vos filtres." : "Vous n'avez pas encore créé de tickets."}
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Priorité</th>
                <th>Ticket</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Technicien</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const tech = users.find((u) => u.id === t.technicienId);
                return (
                  <tr key={t.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td><Badge status={t.priorite} /></td>
                    <td>
                      <div className={styles.ticketId}>#{t.id.toUpperCase()}</div>
                      <div className={styles.ticketTitle} title={t.titre}>{t.titre}</div>
                      {t.localisation && (
                        <div className={styles.ticketLoc}>
                          <IconPin />{t.localisation}
                        </div>
                      )}
                    </td>
                    <td><span className={styles.catBadge}>{t.categorie || "—"}</span></td>
                    <td><Badge status={t.statut} /></td>
                    <td>
                      {tech ? (
                        <div className={styles.techWrap}>
                          <div className={styles.avatar}>{tech.avatar}</div>
                          <span className={styles.techName}>{tech.nom}</span>
                        </div>
                      ) : (
                        <span className={styles.unassigned}>Non assigné</span>
                      )}
                    </td>
                    <td><span className={styles.date}>{formatDate(t.dateCreation)}</span></td>
                    <td>
                      {/* ✅ onClick ouvre le modal */}
                      <button
                        className={styles.detailBtn}
                        onClick={() => setSelectedId(t.id)}
                      >
                        Voir détails <ArrowIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className={styles.cards}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <IconEmpty />
            <div className={styles.emptyTitle}>Aucun ticket trouvé</div>
            <div className={styles.emptySub}>
              {hasFilters ? "Ajustez vos filtres." : "Vous n'avez pas encore créé de tickets."}
            </div>
          </div>
        ) : filtered.map((t, i) => {
          const tech = users.find((u) => u.id === t.technicienId);
          return (
            <div key={t.id} className={styles.card} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{t.titre}</div>
                <Badge status={t.priorite} />
              </div>
              <div className={styles.cardBadges}>
                <Badge status={t.statut} />
                <span className={styles.catBadge}>{t.categorie}</span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardLoc}>
                  <IconPin />{t.localisation || "—"}
                </span>
                {tech ? (
                  <div className={styles.techWrap}>
                    <div className={styles.avatar}>{tech.avatar}</div>
                    <span className={styles.techName}>{tech.nom}</span>
                  </div>
                ) : (
                  <span className={styles.unassigned}>Non assigné</span>
                )}
                <span className={styles.date}>{formatDate(t.dateCreation)}</span>
              </div>
              {/* ✅ Mobile aussi */}
              <button
                className={styles.detailBtnMobile}
                onClick={() => setSelectedId(t.id)}
              >
                Voir détails <ArrowIcon />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// src/pages/admin/GestionMachines.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Mock machines (à déplacer dans mockData.js) ──────────────────────────────
export const machines = [
  {
    id: "m1",
    nom: "Climatiseur Central",
    batiment: "Bâtiment A",
    salle: "Salle des serveurs",
    localisation: "Bâtiment A — Salle des serveurs",
    categorie: "HVAC",
    statut: "en_service",
    description: "Système de climatisation central couvrant l'aile A.",
    dateInstallation: "2021-03-15",
    dateMaintenance: "2024-11-20",
    historique: [],
  },
  {
    id: "m2",
    nom: "Imprimante HP LaserJet",
    batiment: "Bâtiment C",
    salle: "Bureau Scolarité",
    localisation: "Bâtiment C — Bureau Scolarité",
    categorie: "Informatique",
    statut: "en_panne",
    description: "Imprimante réseau partagée du bureau de la scolarité.",
    dateInstallation: "2020-06-01",
    dateMaintenance: "2024-09-10",
    historique: [],
  },
  {
    id: "m3",
    nom: "Chaudière Principale",
    batiment: "Sous-sol",
    salle: "Local technique",
    localisation: "Sous-sol — Local technique",
    categorie: "Mécanique",
    statut: "en_maintenance",
    description: "Chaudière assurant le chauffage de l'ensemble du campus.",
    dateInstallation: "2018-09-01",
    dateMaintenance: "2025-01-05",
    historique: [],
  },
  {
    id: "m4",
    nom: "Serveur Dell PowerEdge",
    batiment: "Bâtiment A",
    salle: "Salle Informatique",
    localisation: "Bâtiment A — Salle Informatique",
    categorie: "Informatique",
    statut: "en_service",
    description: "Serveur principal hébergeant les ressources pédagogiques.",
    dateInstallation: "2022-01-10",
    dateMaintenance: "2024-12-01",
    historique: [],
  },
  {
    id: "m5",
    nom: "Projecteur Epson EB",
    batiment: "Amphithéâtre",
    salle: "Amphi 1",
    localisation: "Amphithéâtre — Amphi 1",
    categorie: "Électrique",
    statut: "en_panne",
    description: "Projecteur haute résolution pour présentations et cours.",
    dateInstallation: "2023-02-14",
    dateMaintenance: "2024-08-20",
    historique: [],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ["Informatique", "HVAC", "Électrique", "Mécanique", "Plomberie", "Sécurité", "Autre"];

const STATUT_CFG = {
  en_service:     { label: "En service",     color: "#00d084", bg: "rgba(0,208,132,0.12)",  border: "rgba(0,208,132,0.3)",  dot: "#00d084" },
  en_panne:       { label: "En panne",       color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", dot: "#f87171" },
  en_maintenance: { label: "En maintenance", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  dot: "#fbbf24" },
};

const EMPTY_FORM = {
  nom: "", batiment: "", salle: "", categorie: "Informatique",
  description: "", dateInstallation: "", statut: "en_service", dateMaintenance: "",
};

// Inject styles once
if (typeof document !== "undefined" && !document.getElementById("gm-kf")) {
  const s = document.createElement("style");
  s.id = "gm-kf";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
    @keyframes gm-in    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes gm-modal { from{opacity:0;transform:scale(.96) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes gm-bg    { from{opacity:0} to{opacity:1} }
    .gm-row:hover { background: rgba(255,255,255,0.03) !important; }
    .gm-btn:hover { opacity: .8; }
    .gm-icon-btn:hover { background: rgba(255,255,255,0.1) !important; }
    .gm-input:focus { outline:none; border-color: #00d084 !important; box-shadow: 0 0 0 3px rgba(0,208,132,0.15); }
    .gm-del:hover { background: rgba(248,113,113,0.2) !important; color: #f87171 !important; }
    .gm-hist:hover { background: rgba(251,191,36,0.15) !important; color: #fbbf24 !important; }
  `;
  document.head.appendChild(s);
}

export default function GestionMachines() {
  const navigate = useNavigate();
  const [data,        setData]        = useState(machines);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("all");
  const [filterStat,  setFilterStat]  = useState("all");
  const [modal,       setModal]       = useState(null); // null | "add" | "edit" | "delete"
  const [current,     setCurrent]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [toast,       setToast]       = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const openAdd  = () => { setForm(EMPTY_FORM); setCurrent(null); setModal("add"); };
  const openEdit = (m)  => { setForm({ ...m }); setCurrent(m); setModal("edit"); };
  const openDel  = (m)  => { setCurrent(m); setModal("delete"); };
  const closeModal = () => { setModal(null); setCurrent(null); };

  const showToast = (msg, color = "#00d084") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    if (!form.nom.trim() || !form.batiment.trim() || !form.salle.trim()) return;
    const localisation = `${form.batiment} — ${form.salle}`;
    if (modal === "add") {
      const newM = { ...form, localisation, id: `m${Date.now()}`, historique: [] };
      setData((d) => [...d, newM]);
      // Aussi pousser dans machines[] exporté si besoin :
      machines.push(newM);
      showToast(`Machine « ${form.nom} » ajoutée`);
    } else {
      const updated = { ...current, ...form, localisation };
      setData((d) => d.map((m) => m.id === current.id ? updated : m));
      const idx = machines.findIndex((m) => m.id === current.id);
      if (idx !== -1) machines[idx] = updated;
      showToast(`Machine « ${form.nom} » modifiée`, "#fbbf24");
    }
    closeModal();
  };

  const handleDelete = () => {
    setData((d) => d.filter((m) => m.id !== current.id));
    const idx = machines.findIndex((m) => m.id === current.id);
    if (idx !== -1) machines.splice(idx, 1);
    showToast(`Machine « ${current.nom} » supprimée`, "#f87171");
    closeModal();
  };

  // ── Filtres ───────────────────────────────────────────────────────────────────
  const visible = data.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.nom.toLowerCase().includes(q) || m.localisation.toLowerCase().includes(q);
    const matchCat    = filterCat  === "all" || m.categorie === filterCat;
    const matchStat   = filterStat === "all" || m.statut    === filterStat;
    return matchSearch && matchCat && matchStat;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = {
    total:        data.length,
    en_service:   data.filter((m) => m.statut === "en_service").length,
    en_panne:     data.filter((m) => m.statut === "en_panne").length,
    en_maintenance: data.filter((m) => m.statut === "en_maintenance").length,
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>Parc machines</h1>
          <p style={S.pageSub}>Inventaire et gestion des équipements</p>
        </div>
        <button style={S.addBtn} className="gm-btn" onClick={openAdd}>
          + Ajouter une machine
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={S.statsGrid}>
        {[
          { label: "Total",         value: stats.total,           color: "#a5b4fc" },
          { label: "En service",    value: stats.en_service,      color: "#00d084" },
          { label: "En panne",      value: stats.en_panne,        color: "#f87171" },
          { label: "Maintenance",   value: stats.en_maintenance,  color: "#fbbf24" },
        ].map((s, i) => (
          <div key={i} style={{ ...S.statCard, borderColor: s.color + "33", animationDelay:`${i*60}ms` }}>
            <span style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:"Outfit,sans-serif" }}>{s.value}</span>
            <span style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div style={S.filterBar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une machine…"
          style={S.searchInput}
          className="gm-input"
        />
        <div style={S.filterGroup}>
          {["all", ...CATEGORIES].map((c) => (
            <button key={c}
              onClick={() => setFilterCat(c)}
              style={{ ...S.chip, ...(filterCat===c ? S.chipOn : {}) }}
              className="gm-btn"
            >
              {c === "all" ? "Toutes catégories" : c}
            </button>
          ))}
        </div>
        <div style={S.filterGroup}>
          {[
            { key:"all",           label:"Tous statuts"  },
            { key:"en_service",    label:"En service"    },
            { key:"en_panne",      label:"En panne"      },
            { key:"en_maintenance",label:"Maintenance"   },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => setFilterStat(key)}
              style={{ ...S.chip, ...(filterStat===key ? S.chipOn : {}) }}
              className="gm-btn"
            >
              {label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft:"auto", fontSize:12, color:"#4b5563" }}>
          {visible.length} machine{visible.length!==1?"s":""}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Nom","Localisation","Catégorie","Statut","Dernière maintenance","Actions"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((m, i) => {
              const sc = STATUT_CFG[m.statut] ?? STATUT_CFG.en_service;
              return (
                <tr key={m.id} className="gm-row"
                  style={{ ...S.tr, animationDelay:`${i*40}ms` }}
                >
                  <td style={S.td}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ ...S.catIcon, background: getCatColor(m.categorie) }}>
                        {getCatEmoji(m.categorie)}
                      </span>
                      <div>
                        <div style={{ fontWeight:700, color:"#f3f4f6", fontSize:14 }}>{m.nom}</div>
                        <div style={{ fontSize:11, color:"#4b5563", fontFamily:"Space Mono,monospace" }}>{m.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...S.td, color:"#9ca3af", fontSize:13 }}>{m.localisation}</td>
                  <td style={S.td}>
                    <span style={S.catBadge}>{m.categorie}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:6,
                      padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                      background: sc.bg, color: sc.color, border:`1px solid ${sc.border}`,
                    }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:sc.dot, flexShrink:0 }} />
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontFamily:"Space Mono,monospace", fontSize:12, color:"#6b7280" }}>
                    {m.dateMaintenance || "—"}
                  </td>
                  <td style={S.td}>
                    <div style={{ display:"flex", gap:6 }}>
                      <ActionBtn
                        label="Historique"
                        extraClass="gm-hist"
                        color="#fbbf24"
                        onClick={() => navigate(`/machines/${m.id}/historique`)}
                      >
                        📋
                      </ActionBtn>
                      <ActionBtn
                        label="Modifier"
                        color="#a5b4fc"
                        onClick={() => openEdit(m)}
                      >
                        ✏️
                      </ActionBtn>
                      <ActionBtn
                        label="Supprimer"
                        extraClass="gm-del"
                        color="#f87171"
                        onClick={() => openDel(m)}
                      >
                        🗑️
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div style={S.empty}>Aucune machine ne correspond aux filtres.</div>
        )}
      </div>

      {/* ── Modal Ajout / Modification ── */}
      {(modal === "add" || modal === "edit") && (
        <div style={S.overlay} onClick={(e) => e.target===e.currentTarget && closeModal()}>
          <div style={S.modalBox}>

            <div style={S.modalHead}>
              <div>
                <p style={S.modalSub}>{modal==="add" ? "Nouvelle machine" : "Modifier la machine"}</p>
                <h2 style={S.modalTitle}>{modal==="add" ? "Ajouter un équipement" : form.nom}</h2>
              </div>
              <button style={S.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <div style={S.modalBody}>
              <div style={S.formGrid}>

                <FormField label="Nom de la machine *">
                  <input name="nom" value={form.nom} onChange={handleFormChange}
                    placeholder="Ex : Imprimante HP LaserJet"
                    style={S.input} className="gm-input" />
                </FormField>

                <FormField label="Catégorie *">
                  <select name="categorie" value={form.categorie} onChange={handleFormChange}
                    style={S.input} className="gm-input">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>

                <FormField label="Bâtiment *">
                  <input name="batiment" value={form.batiment} onChange={handleFormChange}
                    placeholder="Ex : Bâtiment A"
                    style={S.input} className="gm-input" />
                </FormField>

                <FormField label="Salle *">
                  <input name="salle" value={form.salle} onChange={handleFormChange}
                    placeholder="Ex : Salle 203"
                    style={S.input} className="gm-input" />
                </FormField>

                <FormField label="Statut">
                  <select name="statut" value={form.statut} onChange={handleFormChange}
                    style={S.input} className="gm-input">
                    <option value="en_service">En service</option>
                    <option value="en_panne">En panne</option>
                    <option value="en_maintenance">En maintenance</option>
                  </select>
                </FormField>

                <FormField label="Date d'installation">
                  <input name="dateInstallation" type="date" value={form.dateInstallation}
                    onChange={handleFormChange} style={S.input} className="gm-input" />
                </FormField>

                <FormField label="Dernière maintenance">
                  <input name="dateMaintenance" type="date" value={form.dateMaintenance}
                    onChange={handleFormChange} style={S.input} className="gm-input" />
                </FormField>

                <div style={{ gridColumn:"1/-1" }}>
                  <FormField label="Description">
                    <textarea name="description" value={form.description} onChange={handleFormChange}
                      rows={3} placeholder="Décrivez l'équipement…"
                      style={{ ...S.input, resize:"vertical" }} className="gm-input" />
                  </FormField>
                </div>

              </div>
            </div>

            <div style={S.modalFoot}>
              <button style={S.cancelBtn} className="gm-btn" onClick={closeModal}>Annuler</button>
              <button
                style={{
                  ...S.saveBtn,
                  opacity: (form.nom && form.batiment && form.salle) ? 1 : 0.4,
                  cursor:  (form.nom && form.batiment && form.salle) ? "pointer" : "not-allowed",
                }}
                className="gm-btn"
                onClick={handleSave}
                disabled={!form.nom || !form.batiment || !form.salle}
              >
                {modal==="add" ? "Ajouter la machine" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Suppression ── */}
      {modal === "delete" && current && (
        <div style={S.overlay} onClick={(e) => e.target===e.currentTarget && closeModal()}>
          <div style={{ ...S.modalBox, maxWidth:420 }}>
            <div style={S.modalHead}>
              <h2 style={{ ...S.modalTitle, color:"#f87171" }}>Supprimer la machine</h2>
              <button style={S.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ color:"#9ca3af", margin:0, lineHeight:1.6 }}>
                Voulez-vous vraiment supprimer{" "}
                <strong style={{ color:"#f3f4f6" }}>« {current.nom} »</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            <div style={S.modalFoot}>
              <button style={S.cancelBtn} className="gm-btn" onClick={closeModal}>Annuler</button>
              <button style={{ ...S.saveBtn, background:"#dc2626" }} className="gm-btn" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ ...S.toast, borderLeft:`3px solid ${toast.color}` }}>
          <span style={{ color:toast.color, fontSize:16 }}>●</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Sous-composants ──────────────────────────────────────────────────────── */
function ActionBtn({ children, label, onClick, extraClass = "", color }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`gm-icon-btn ${extraClass}`}
      style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:5,
        padding:"5px 10px", borderRadius:7, border:"none",
        background:"rgba(255,255,255,0.06)", color:"#9ca3af",
        cursor:"pointer", fontSize:13, fontFamily:"inherit", fontWeight:600,
        transition:"background .15s, color .15s",
      }}
    >
      {children} <span style={{ fontSize:11 }}>{label}</span>
    </button>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Helpers couleur catégorie ───────────────────────────────────────────── */
function getCatColor(cat) {
  const m = { Informatique:"rgba(99,102,241,0.2)", HVAC:"rgba(14,165,233,0.2)", Électrique:"rgba(251,191,36,0.2)", Mécanique:"rgba(107,114,128,0.2)", Plomberie:"rgba(59,130,246,0.2)", Sécurité:"rgba(239,68,68,0.2)", Autre:"rgba(156,163,175,0.2)" };
  return m[cat] ?? m.Autre;
}
function getCatEmoji(cat) {
  const m = { Informatique:"💻", HVAC:"❄️", Électrique:"⚡", Mécanique:"⚙️", Plomberie:"🔧", Sécurité:"🔒", Autre:"📦" };
  return m[cat] ?? "📦";
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page:     { minHeight:"100vh", background:"#0f1117", padding:"32px 36px", fontFamily:"Outfit,sans-serif", color:"#f3f4f6" },

  topBar:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 },
  pageTitle:{ margin:0, fontSize:26, fontWeight:800, color:"#f3f4f6", letterSpacing:"-0.5px" },
  pageSub:  { margin:"4px 0 0", color:"#4b5563", fontSize:14 },
  addBtn:   {
    padding:"10px 22px", borderRadius:10, border:"none",
    background:"#00d084", color:"#0a1a10",
    fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:700,
    cursor:"pointer", transition:"opacity .15s",
  },

  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 },
  statCard: {
    background:"#1a1d27", borderRadius:12, padding:"18px 20px",
    display:"flex", flexDirection:"column", gap:4,
    border:"1px solid", animation:"gm-in .4s ease both",
  },

  filterBar:{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20, alignItems:"center" },
  searchInput:{
    padding:"8px 14px", borderRadius:9, border:"1.5px solid #2d2f3d",
    background:"#1a1d27", color:"#f3f4f6", fontSize:13, fontFamily:"Outfit,sans-serif",
    width:220, transition:"border-color .2s",
  },
  filterGroup:{ display:"flex", gap:6, flexWrap:"wrap" },
  chip:{
    padding:"5px 14px", borderRadius:20, border:"1px solid #2d2f3d",
    background:"#1a1d27", color:"#6b7280", fontSize:12, fontWeight:600,
    cursor:"pointer", fontFamily:"Outfit,sans-serif", transition:"all .15s",
  },
  chipOn:{ background:"#00d08420", color:"#00d084", borderColor:"#00d08450" },

  tableWrap:{ background:"#1a1d27", borderRadius:14, overflow:"hidden", border:"1px solid #2d2f3d" },
  table:    { width:"100%", borderCollapse:"collapse" },
  th:{
    padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700,
    color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.6px",
    borderBottom:"1px solid #2d2f3d", background:"#161820",
  },
  tr:{ borderBottom:"1px solid #1e2030", transition:"background .12s", animation:"gm-in .3s ease both" },
  td:{ padding:"14px 16px", verticalAlign:"middle" },
  catIcon:{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  catBadge:{
    display:"inline-block", padding:"3px 10px", borderRadius:6,
    background:"rgba(165,180,252,0.1)", color:"#a5b4fc",
    fontSize:12, fontWeight:600, border:"1px solid rgba(165,180,252,0.2)",
  },
  empty:{ textAlign:"center", padding:"48px 0", color:"#374151", fontSize:15 },

  // Modal
  overlay:{
    position:"fixed", inset:0, background:"rgba(5,7,15,0.8)", backdropFilter:"blur(6px)",
    display:"flex", alignItems:"center", justifyContent:"center", zIndex:1300, padding:16,
    animation:"gm-bg .15s ease",
  },
  modalBox:{
    background:"#1a1d27", borderRadius:18, width:"100%", maxWidth:680, maxHeight:"92vh",
    display:"flex", flexDirection:"column", border:"1px solid #2d2f3d",
    boxShadow:"0 40px 100px rgba(0,0,0,0.6)", animation:"gm-modal .25s ease", overflow:"hidden",
  },
  modalHead:{
    padding:"22px 28px 18px", borderBottom:"1px solid #2d2f3d",
    display:"flex", justifyContent:"space-between", alignItems:"flex-start",
  },
  modalSub:{ margin:"0 0 3px", fontSize:11, color:"#4b5563", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px" },
  modalTitle:{ margin:0, fontSize:18, fontWeight:800, color:"#f3f4f6" },
  closeBtn:{
    background:"rgba(255,255,255,0.07)", border:"none", borderRadius:"50%",
    width:34, height:34, cursor:"pointer", fontSize:13, color:"#9ca3af",
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    transition:"background .15s",
  },
  modalBody:{ overflowY:"auto", padding:"22px 28px", flex:1 },
  formGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  input:{
    padding:"10px 14px", borderRadius:9, border:"1.5px solid #2d2f3d",
    background:"#12141e", color:"#f3f4f6", fontSize:14,
    fontFamily:"Outfit,sans-serif", width:"100%", boxSizing:"border-box",
    transition:"border-color .2s, box-shadow .2s",
  },
  modalFoot:{
    padding:"16px 28px 22px", borderTop:"1px solid #2d2f3d",
    display:"flex", justifyContent:"flex-end", gap:10,
  },
  cancelBtn:{
    padding:"10px 22px", borderRadius:9, border:"1px solid #2d2f3d",
    background:"transparent", color:"#9ca3af",
    fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, cursor:"pointer",
  },
  saveBtn:{
    padding:"10px 26px", borderRadius:9, border:"none",
    background:"#00d084", color:"#0a1a10",
    fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:700, cursor:"pointer",
    transition:"opacity .15s",
  },

  // Toast
  toast:{
    position:"fixed", bottom:28, right:28,
    background:"#1a1d27", color:"#f3f4f6",
    padding:"13px 20px", borderRadius:10, fontSize:14, fontWeight:600,
    display:"flex", alignItems:"center", gap:10,
    boxShadow:"0 8px 32px rgba(0,0,0,0.4)", zIndex:2000,
    border:"1px solid #2d2f3d", animation:"gm-in .25s ease",
    fontFamily:"Outfit,sans-serif",
  },
};

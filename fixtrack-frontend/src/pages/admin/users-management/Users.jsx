// ─────────────────────────────────────────────────────────────
//  src/pages/admin/GestionUsers.jsx
//  Page CRUD utilisateurs — FixTrack
//  Styles : ./gestion-users.css
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import "./Users.css";
import { users as mockUsers } from "../../../data/mockData";

// ─── Import direct depuis mockData (statut + dateCreation inclus) ─
const INITIAL_USERS = mockUsers.map(u => ({
  id:           u.id,
  nom:          u.nom,
  email:        u.email,
  role:         u.role,
  statut:       u.statut,
  dateCreation: u.dateCreation,
}));

// ─── Constantes rôles ───────────────────────────────────────
export const ROLE_META = {
  employee:   { label:"Employé",        color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", avatar:"#059669" },
  technician: { label:"Technicien",     color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", avatar:"#D97706" },
  manager:    { label:"Manager",        color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE", avatar:"#7C3AED" },
  admin:      { label:"Administrateur", color:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE", avatar:"#1D4ED8" },
};

// ─── Helpers ────────────────────────────────────────────────
const uid      = () => "u" + Date.now();
const initials = n  => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const fmtDate  = d  => new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });

// ─── SVG icons ──────────────────────────────────────────────
const ICONS = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  block:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  close:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  warn:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  user:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  lock:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  tag:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  users2: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

const Ico = ({ k, size = 16, color }) => (
  <span style={{ display:"inline-flex", width:size, height:size, color, flexShrink:0 }}>
    {ICONS[k]}
  </span>
);

// ─────────────────────────────────────────────────────────────
//  COMPOSANTS UI
// ─────────────────────────────────────────────────────────────

function Avatar({ name, role, size = 38 }) {
  const color = ROLE_META[role]?.avatar || "#94A3B8";
  return (
    <div
      className="ft-avatar"
      style={{ width:size, height:size, backgroundColor:color, fontSize:size * 0.34 }}
    >
      {initials(name)}
    </div>
  );
}

function RoleChip({ role }) {
  const m = ROLE_META[role] || { label:role, color:"#64748B", bg:"#F1F5F9", border:"#E2E8F0" };
  return (
    <span className="ft-chip" style={{ background:m.bg, color:m.color, borderColor:m.border }}>
      <span className="ft-chip__dot" style={{ background:m.color }} />
      {m.label}
    </span>
  );
}

// Badge statut — simple texte coloré sans cadre
function StatusBadge({ statut }) {
  const on = statut === "actif";
  return (
    <span style={{
      fontSize: "0.72rem",
      fontWeight: 600,
      color: on ? "#16A34A" : "#9CA3AF",
      letterSpacing: "0.01em",
    }}>
      {on ? "Actif" : "Inactif"}
    </span>
  );
}

function StatTile({ label, value, sub, color, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ft-tile"
      style={{
        background:  active ? color : "#fff",
        borderColor: active ? color : "#E2E8F0",
        boxShadow:   active ? `0 4px 18px ${color}44` : "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      <div className="ft-tile__top">
        <div className="ft-tile__icon" style={{ background: active ? "rgba(255,255,255,.18)" : color + "14" }}>
          <Ico k={icon} size={17} color={active ? "#fff" : color} />
        </div>
        <span className="ft-tile__value" style={{ color: active ? "#fff" : "#0F172A" }}>
          {value}
        </span>
      </div>
      <p className="ft-tile__label" style={{ color: active ? "rgba(255,255,255,.8)" : "#64748B" }}>
        {label}
      </p>
      {sub && (
        <p className="ft-tile__sub" style={{ color: active ? "rgba(255,255,255,.55)" : "#94A3B8" }}>
          {sub}
        </p>
      )}
    </button>
  );
}

function Modal({ open, onClose, title, subtitle, children, width = 480 }) {
  if (!open) return null;
  return (
    <div className="ft-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ft-modal" style={{ maxWidth:width }}>
        <div className="ft-modal__stripe" />
        <div className="ft-modal__header">
          <div>
            <h2 className="ft-modal__title">{title}</h2>
            {subtitle && <p className="ft-modal__subtitle">{subtitle}</p>}
          </div>
          <button className="ft-modal__close" onClick={onClose}>
            <Ico k="close" size={17} />
          </button>
        </div>
        <div className="ft-modal__body">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, icon, error, children }) {
  return (
    <div className="ft-form__field">
      <label className="ft-form__label">
        <Ico k={icon} size={12} color="#94A3B8" />
        {label}
      </label>
      {children}
      {error && <span className="ft-form__error">{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FORMULAIRE — sans champ département
// ─────────────────────────────────────────────────────────────
const BLANK_FORM = { nom:"", email:"", password:"", role:"employee" };

function UserForm({ initial, isEdit, onSubmit, onCancel }) {
  const [form, setForm]       = useState(initial || BLANK_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const setField = key => e => setForm(prev => ({ ...prev, [key]:e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.nom.trim())                    err.nom      = "Nom requis";
    if (!form.email.includes("@"))           err.email    = "Email invalide";
    if (!isEdit && form.password.length < 6) err.password = "6 caractères minimum";
    return err;
  };

  const handleSubmit = () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(form); }, 550);
  };

  const cls = hasErr => `ft-input${hasErr ? " ft-input--error" : ""}`;

  return (
    <div>
      {/* Aperçu dynamique */}
      <div className="ft-form__preview">
        <Avatar name={form.nom || "?"} role={form.role} size={44} />
        <div>
          <p className="ft-form__preview-name">
            {form.nom || <span className="ft-form__preview-placeholder">Nom de l'utilisateur</span>}
          </p>
          <div style={{ marginTop:6 }}>
            <RoleChip role={form.role} />
          </div>
        </div>
      </div>

      <div className="ft-form__grid">
        {/* Nom — pleine largeur */}
        <div className="ft-form__full">
          <Field label="Nom complet" icon="user" error={errors.nom}>
            <input
              className={cls(errors.nom)}
              value={form.nom}
              onChange={setField("nom")}
              placeholder="Ex: Jean Dupont"
            />
          </Field>
        </div>

        {/* Email — pleine largeur */}
        <div className="ft-form__full">
          <Field label="Adresse email" icon="mail" error={errors.email}>
            <input
              type="email"
              className={cls(errors.email)}
              value={form.email}
              onChange={setField("email")}
              placeholder="jean@fst.tn"
            />
          </Field>
        </div>

        {/* Mot de passe + Rôle côte à côte */}
        <Field label={isEdit ? "Nouveau mot de passe" : "Mot de passe"} icon="lock" error={errors.password}>
          <input
            type="password"
            className={cls(errors.password)}
            value={form.password}
            onChange={setField("password")}
            placeholder={isEdit ? "Laisser vide = inchangé" : "6+ caractères"}
          />
        </Field>

        <Field label="Rôle" icon="tag">
          <select
            className="ft-input"
            style={{ cursor:"pointer" }}
            value={form.role}
            onChange={setField("role")}
          >
            {Object.entries(ROLE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="ft-form__actions">
        <button className="ft-btn-cancel" onClick={onCancel}>Annuler</button>
        <button className="ft-btn-submit" onClick={handleSubmit}>
          {loading ? <span className="ft-spinner" /> : <Ico k="check" size={15} />}
          {isEdit ? "Enregistrer les modifications" : "Créer l'utilisateur"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DIALOG CONFIRMATION
// ─────────────────────────────────────────────────────────────
function ConfirmDialog({ user, onConfirm, onClose }) {
  const deactivate = user?.statut === "actif";
  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={deactivate ? "Désactiver le compte" : "Réactiver le compte"}
      subtitle="Confirmez cette action pour continuer."
      width={400}
    >
      <div
        className="ft-confirm-box"
        style={{
          background: deactivate ? "#FEF2F2" : "#F0FDF4",
          border: `1.5px solid ${deactivate ? "#FECACA" : "#BBF7D0"}`,
        }}
      >
        <Ico k="warn" size={20} color={deactivate ? "#EF4444" : "#22C55E"} />
        <div>
          <p className="ft-confirm-box__title" style={{ color: deactivate ? "#7F1D1D" : "#14532D" }}>
            {deactivate ? "Accès immédiatement révoqué" : "Accès immédiatement rétabli"}
          </p>
          <p className="ft-confirm-box__text" style={{ color: deactivate ? "#B91C1C" : "#15803D" }}>
            {deactivate
              ? `${user?.nom} ne pourra plus se connecter à FixTrack.`
              : `${user?.nom} pourra à nouveau utiliser FixTrack.`}
          </p>
        </div>
      </div>
      <div className="ft-form__actions">
        <button className="ft-btn-cancel" onClick={onClose}>Annuler</button>
        <button
          className={deactivate ? "ft-btn-danger" : "ft-btn-success"}
          onClick={onConfirm}
        >
          <Ico k={deactivate ? "block" : "check"} size={15} />
          {deactivate ? "Désactiver" : "Réactiver"}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
//  PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────
export default function Users() {

  const [users, setUsers]             = useState(INITIAL_USERS);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [statFilter, setStatFilter]   = useState("all");
  const [sort, setSort]               = useState({ col:"dateCreation", dir:"desc" });
  const [addOpen, setAddOpen]         = useState(false);
  const [editUser, setEditUser]       = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [toast, setToast]             = useState(null);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Stats ──────────────────────────────────────────────────
  const total     = users.length;
  const employees = users.filter(u => u.role === "employee").length;
  const techs     = users.filter(u => u.role === "technician").length;
  const admins    = users.filter(u => u.role === "admin" || u.role === "manager").length;
  const isAdminManagerFilter = roleFilter === "admin" || roleFilter === "manager";

  // ── Filtrage + tri ─────────────────────────────────────────
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statFilter === "all" || u.statut === statFilter;
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      const va = a[sort.col] || "";
      const vb = b[sort.col] || "";
      return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const toggleSort   = col => setSort(s =>
    s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir:"asc" }
  );
  const resetFilters = () => { setSearch(""); setRoleFilter("all"); setStatFilter("all"); };
  const hasFilters   = search || roleFilter !== "all" || statFilter !== "all";

  // ── CRUD ──────────────────────────────────────────────────
  const handleAdd = form => {
    setUsers(prev => [
      ...prev,
      { ...form, id:uid(), statut:"actif", dateCreation:new Date().toISOString().split("T")[0] },
    ]);
    setAddOpen(false);
    notify(`${form.nom} créé avec succès.`);
  };

  const handleEdit = form => {
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    setEditUser(null);
    notify(`Profil de ${form.nom} mis à jour.`);
  };

  const handleToggleStatus = () => {
    const next = confirmUser.statut === "actif" ? "inactif" : "actif";
    setUsers(prev => prev.map(u => u.id === confirmUser.id ? { ...u, statut:next } : u));
    notify(`${confirmUser.nom} est maintenant ${next}.`, next === "actif" ? "ok" : "warn");
    setConfirmUser(null);
  };

  const TH = ({ col, children }) => (
    <th
      onClick={() => col && toggleSort(col)}
      className={`ft-th${col ? (sort.col === col ? " ft-th--active" : "") : " ft-th--no-sort"}`}
    >
      {children}
      {col && (
        <span className="ft-th__arrow" style={{ opacity: sort.col === col ? 1 : 0.3 }}>
          {sort.col === col ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      )}
    </th>
  );

  return (
    <div className="ft-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`ft-toast ft-toast--${toast.type}`}>
          <Ico k={toast.type === "warn" ? "warn" : "check"} size={16}
            color={toast.type === "warn" ? "#FCD34D" : "#4ADE80"} />
          {toast.msg}
        </div>
      )}

      {/* ── Header éditorial ── */}
      <div className="ft-header">
        <div>
          <div className="ft-header__overline">
            <div className="ft-header__line" />
            <span className="ft-header__label">Administration</span>
          </div>
          <h1 className="ft-header__title">Gestion des utilisateurs</h1>
          <p className="ft-header__sub">{total} utilisateurs au total</p>
        </div>
        <button className="ft-btn-add" onClick={() => setAddOpen(true)}>
          <Ico k="plus" size={15} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* ── Stat tiles ── */}
      <div className="ft-tiles">
        <StatTile label="Tous les utilisateurs" value={total} icon="users2" color="#1D4ED8"
          sub={`${total} comptes créés`}
          active={roleFilter === "all" && statFilter === "all"}
          onClick={() => { setRoleFilter("all"); setStatFilter("all"); }} />
        <StatTile label="Employés" value={employees} icon="user" color="#059669"
          sub="Personnel de terrain"
          active={roleFilter === "employee"}
          onClick={() => setRoleFilter(r => r === "employee" ? "all" : "employee")} />
        <StatTile label="Techniciens" value={techs} icon="tag" color="#D97706"
          sub="Équipe maintenance"
          active={roleFilter === "technician"}
          onClick={() => setRoleFilter(r => r === "technician" ? "all" : "technician")} />
        <StatTile label="Admins & Managers" value={admins} icon="lock" color="#7C3AED"
          sub="Accès privilégiés"
          active={isAdminManagerFilter}
          onClick={() => setRoleFilter(r => (r === "admin" || r === "manager") ? "all" : "admin")} />
      </div>

      {/* ── Toolbar ── */}
      <div className="ft-toolbar">
        <div className="ft-toolbar__search">
          <span className="ft-toolbar__search-icon"><Ico k="search" size={15} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="ft-input" placeholder="Rechercher nom ou email…"
            style={{ paddingLeft:34, maxWidth:320 }} />
        </div>

        <div className="ft-toolbar__divider" />

        {/* Pills rôle */}
        <div className="ft-pills">
          {[
            ["all", "Tous"],
            ...Object.entries(ROLE_META).map(([k, v]) => [k, v.label]),
          ].map(([val, lbl]) => {
            const isActive     = val === "all" ? roleFilter === "all"
              : val === "admin" ? isAdminManagerFilter : roleFilter === val;
            const activeColor  = val === "all" ? "#1D4ED8" : ROLE_META[val]?.color  || "#1D4ED8";
            const activeBg     = val === "all" ? "#EFF6FF" : ROLE_META[val]?.bg     || "#EFF6FF";
            const activeBorder = val === "all" ? "#BFDBFE" : ROLE_META[val]?.border || "#BFDBFE";
            return (
              <button key={val} onClick={() => setRoleFilter(val)} className="ft-pill"
                style={{
                  border:     `1.5px solid ${isActive ? activeBorder : "#E2E8F0"}`,
                  background: isActive ? activeBg    : "transparent",
                  color:      isActive ? activeColor : "#64748B",
                }}>
                {lbl}
              </button>
            );
          })}
        </div>

        {/* Filtre statut */}
        <div className="ft-status-filters">
          {[
            { val:"all",     label:"Tous",     dot:null,      border:"#BFDBFE", bg:"#EFF6FF", color:"#1D4ED8" },
            { val:"actif",   label:"Actifs",   dot:"#22C55E", border:"#BBF7D0", bg:"#F0FDF4", color:"#15803D" },
            { val:"inactif", label:"Inactifs", dot:"#CBD5E1", border:"#E2E8F0", bg:"#F8FAFC", color:"#64748B" },
          ].map(({ val, label, dot, border, bg, color }) => (
            <button key={val} onClick={() => setStatFilter(val)} className="ft-status-btn"
              style={{
                border:     `1.5px solid ${statFilter === val ? border : "#E2E8F0"}`,
                background: statFilter === val ? bg    : "#fff",
                color:      statFilter === val ? color : "#94A3B8",
                boxShadow:  statFilter === val ? "0 1px 4px rgba(0,0,0,.08)" : "none",
              }}>
              {dot && (
                <span
                  className={`ft-status-btn__dot${val === "actif" && statFilter === "actif" ? " ft-status-btn__dot--pulse" : ""}`}
                  style={{ background:dot }} />
              )}
              {label}
              <span className="ft-status-btn__count"
                style={{
                  background: statFilter === val ? border : "#F1F5F9",
                  color:      statFilter === val ? color  : "#94A3B8",
                }}>
                {val === "all" ? users.length : users.filter(u => u.statut === val).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="ft-table-card">
        <div className="ft-table-scroll">
          <table className="ft-table">
            <thead>
              <tr>
                <th col="nom">Utilisateur</th>
                <th col="email">Email</th>
                <th col="role">Rôle</th>
                <th col="dateCreation">Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ft-td">
                    <div className="ft-empty">
                      <div className="ft-empty__inner">
                        <div className="ft-empty__icon">
                          <Ico k="search" size={22} color="#CBD5E1" />
                        </div>
                        <p className="ft-empty__text">Aucun résultat</p>
                        <button className="ft-empty__reset" onClick={resetFilters}>
                          Réinitialiser les filtres
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id} className="ft-row" style={{ animationDelay:`${i * 20}ms` }}>

                    {/* Colonne utilisateur : badge statut AU-DESSUS du nom */}
                    <td className="ft-td">
                      <div className="ft-user-cell">
                        <Avatar name={u.nom} role={u.role} />
                        <div className="ft-user-info">
                          <p className="ft-user-name">{u.nom}</p>
                          <StatusBadge statut={u.statut} />
                        </div>
                      </div>
                    </td>

                    <td className="ft-td">
                      <span className="ft-email">{u.email}</span>
                    </td>

                    <td className="ft-td">
                      <RoleChip role={u.role} />
                    </td>

                    <td className="ft-td">
                      <span className="ft-date">{fmtDate(u.dateCreation)}</span>
                    </td>

                    <td className="ft-td">
                      <div className="ft-actions">
                        <button className="ft-btn-edit" onClick={() => setEditUser({ ...u })}>
                          <Ico k="edit" size={12} /> Modifier
                        </button>
                        <button
                          className={u.statut === "actif" ? "ft-btn-deactivate" : "ft-btn-activate"}
                          onClick={() => setConfirmUser(u)}
                        >
                          <Ico k={u.statut === "actif" ? "block" : "check"} size={12} />
                          {u.statut === "actif" ? "Désactiver" : "Réactiver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ft-table-footer">
          <span className="ft-footer-count">
            <b style={{ color:"#1D4ED8" }}>{filtered.length}</b>
            {" "}résultat{filtered.length !== 1 ? "s" : ""} sur{" "}
            <b style={{ color:"#64748B" }}>{total}</b> utilisateurs
          </span>
          {hasFilters && (
            <button className="ft-clear-btn" onClick={resetFilters}>
              <Ico k="close" size={11} /> Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}
        title="Ajouter un utilisateur" subtitle="Créer un nouveau compte sur FixTrack.">
        <UserForm isEdit={false} onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)}
        title="Modifier le profil"
        subtitle={editUser ? `Modification de ${editUser.nom}` : ""}>
        {editUser && (
          <UserForm isEdit
            initial={{ nom:editUser.nom, email:editUser.email, password:"", role:editUser.role }}
            onSubmit={handleEdit}
            onCancel={() => setEditUser(null)} />
        )}
      </Modal>

      <ConfirmDialog user={confirmUser} onConfirm={handleToggleStatus} onClose={() => setConfirmUser(null)} />
    </div>
  );
}
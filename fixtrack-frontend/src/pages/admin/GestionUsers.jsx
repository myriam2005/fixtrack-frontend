import { useState } from "react";

// ─── Mock Data (local copy, simulating mockData.js import) ────────────────────
const initialUsers = [
  {
    id: "u1",
    nom: "Jean Dupont",
    email: "jean@fst.tn",
    password: "123456",
    role: "employee",
    avatar: "JD",
    telephone: "+216 22 111 222",
    statut: "actif",
    dateCreation: "2025-01-10",
  },
  {
    id: "u2",
    nom: "Sara Ben Ali",
    email: "sara@fst.tn",
    password: "123456",
    role: "technician",
    avatar: "SB",
    competences: ["Électrique", "HVAC"],
    statut: "actif",
    dateCreation: "2025-01-08",
  },
  {
    id: "u3",
    nom: "Karim Maaloul",
    email: "karim@fst.tn",
    password: "123456",
    role: "technician",
    avatar: "KM",
    competences: ["Informatique", "Mécanique"],
    statut: "actif",
    dateCreation: "2025-01-07",
  },
  {
    id: "u4",
    nom: "Lina Trabelsi",
    email: "lina@fst.tn",
    password: "123456",
    role: "manager",
    avatar: "LT",
    statut: "actif",
    dateCreation: "2025-01-05",
  },
  {
    id: "u5",
    nom: "Admin FST",
    email: "admin@fst.tn",
    password: "123456",
    role: "admin",
    avatar: "AF",
    statut: "actif",
    dateCreation: "2025-01-01",
  },
];

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  employee:   { label: "Employé",        bg: "#3B82F6", text: "#FFFFFF" },
  technician: { label: "Technicien",     bg: "#F59E0B", text: "#FFFFFF" },
  manager:    { label: "Manager",        bg: "#8B5CF6", text: "#FFFFFF" },
  admin:      { label: "Administrateur", bg: "#EF4444", text: "#FFFFFF" },
};

const ROLES = ["employee", "technician", "manager", "admin"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateId = () => "u" + Date.now();

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || { label: role, bg: "#E5E7EB", text: "#111827" };
  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 6,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ statut }) {
  const isActif = statut === "actif";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        backgroundColor: isActif ? "#DCFCE7" : "#F3F4F6",
        color: isActif ? "#15803D" : "#6B7280",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 6,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: isActif ? "#22C55E" : "#9CA3AF",
          display: "inline-block",
        }}
      />
      {isActif ? "Actif" : "Inactif"}
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  const initials = getInitials(name);
  const colors = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              fontSize: 22,
              lineHeight: 1,
              padding: "2px 6px",
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── User Form ────────────────────────────────────────────────────────────────
const emptyForm = { nom: "", email: "", password: "", role: "employee" };

function UserForm({ initialData = emptyForm, onSubmit, onCancel, isEdit }) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Le nom est requis";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email invalide";
    if (!isEdit && !form.password.trim()) e.password = "Le mot de passe est requis";
    if (!form.role) e.role = "Le rôle est requis";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        style={{
          ...styles.input,
          borderColor: errors[key] ? "#EF4444" : "#E5E7EB",
        }}
      />
      {errors[key] && (
        <span style={{ fontSize: 12, color: "#EF4444", marginTop: 4, display: "block" }}>
          {errors[key]}
        </span>
      )}
    </div>
  );

  return (
    <div>
      {field("nom", "Nom complet", "text", "Ex: Jean Dupont")}
      {field("email", "Email", "email", "Ex: jean@fst.tn")}
      {field("password", isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe", "password", "••••••••")}

      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Rôle</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={{ ...styles.input, cursor: "pointer" }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_CONFIG[r].label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onCancel} style={styles.btnSecondary}>
          Annuler
        </button>
        <button onClick={handleSubmit} style={styles.btnPrimary}>
          {isEdit ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, user }) {
  if (!open || !user) return null;
  const action = user.statut === "actif" ? "désactiver" : "réactiver";
  const actionLabel = user.statut === "actif" ? "Désactiver" : "Réactiver";
  const btnStyle = user.statut === "actif" ? styles.btnDanger : styles.btnSuccess;

  return (
    <Modal open={open} onClose={onClose} title="Confirmation requise">
      <p style={{ color: "#374151", margin: "0 0 8px", lineHeight: 1.6 }}>
        Êtes-vous sûr de vouloir <strong>{action}</strong> le compte de{" "}
        <strong>{user.nom}</strong> ?
      </p>
      {user.statut === "actif" && (
        <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 24px" }}>
          L'utilisateur ne pourra plus se connecter.
        </p>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onClose} style={styles.btnSecondary}>
          Annuler
        </button>
        <button onClick={onConfirm} style={btnStyle}>
          {actionLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GestionUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // user object
  const [confirmModal, setConfirmModal] = useState(null); // user object

  // ── Filtered list
  const filtered = users.filter((u) => {
    const matchSearch =
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // ── CRUD handlers
  const handleAdd = (form) => {
    const newUser = {
      ...form,
      id: generateId(),
      avatar: getInitials(form.nom),
      statut: "actif",
      dateCreation: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    setAddModal(false);
  };

  const handleEdit = (form) => {
    setUsers(
      users.map((u) =>
        u.id === editModal.id
          ? {
              ...u,
              nom: form.nom,
              email: form.email,
              role: form.role,
              avatar: getInitials(form.nom),
              ...(form.password ? { password: form.password } : {}),
            }
          : u
      )
    );
    setEditModal(null);
  };

  const handleToggleStatus = () => {
    setUsers(
      users.map((u) =>
        u.id === confirmModal.id
          ? { ...u, statut: u.statut === "actif" ? "inactif" : "actif" }
          : u
      )
    );
    setConfirmModal(null);
  };

  const totalActif = users.filter((u) => u.statut === "actif").length;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1
  style={{
    margin: "0 0 6px",
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 600,
    color: "#0F172A",
    fontFamily: "'DM Serif Display', serif",
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  }}
>
  Gestion des utilisateurs
</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>
          {users.length} utilisateurs au total · {totalActif} actifs
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} style={styles.statCard}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: cfg.bg + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {role === "employee" ? "👤" : role === "technician" ? "🔧" : role === "manager" ? "📊" : "⚙️"}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: cfg.bg, lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, fontWeight: 500 }}>
                {cfg.label}{count > 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…"
            style={{
              ...styles.input,
              paddingLeft: 36,
              margin: 0,
              maxWidth: 320,
            }}
          />
        </div>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ ...styles.input, width: "auto", margin: 0, minWidth: 150, cursor: "pointer" }}
        >
          <option value="all">Tous les rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_CONFIG[r].label}
            </option>
          ))}
        </select>

        {/* Add button */}
        <button onClick={() => setAddModal(true)} style={styles.btnPrimary}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Utilisateur", "Email", "Rôle", "Date création", "Statut", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((user, idx) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Utilisateur */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar name={user.nom} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                            {user.nom}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "#6B7280" }}>
                      {user.email}
                    </td>

                    {/* Rôle */}
                    <td style={{ padding: "14px 16px" }}>
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>
                      {formatDate(user.dateCreation)}
                    </td>

                    {/* Statut */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge statut={user.statut || "actif"} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setEditModal(user)}
                          style={styles.btnAction}
                          title="Modifier"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Modifier
                        </button>
                        <button
                          onClick={() => setConfirmModal(user)}
                          style={user.statut === "actif" ? styles.btnActionDanger : styles.btnActionSuccess}
                          title={user.statut === "actif" ? "Désactiver" : "Réactiver"}
                        >
                          {user.statut === "actif" ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              </svg>
                              Désactiver
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Réactiver
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #F3F4F6",
            fontSize: 13,
            color: "#9CA3AF",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            Affichage de <strong style={{ color: "#374151" }}>{filtered.length}</strong> sur{" "}
            <strong style={{ color: "#374151" }}>{users.length}</strong> utilisateurs
          </span>
        </div>
      </div>

      {/* ── Modal : Ajouter ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Ajouter un utilisateur">
        <UserForm onSubmit={handleAdd} onCancel={() => setAddModal(false)} isEdit={false} />
      </Modal>

      {/* ── Modal : Modifier ── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier l'utilisateur">
        {editModal && (
          <UserForm
            initialData={{
              nom: editModal.nom,
              email: editModal.email,
              password: "",
              role: editModal.role,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditModal(null)}
            isEdit={true}
          />
        )}
      </Modal>

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleToggleStatus}
        user={confirmModal}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
  },
  btnSecondary: {
    flex: 1,
    padding: "9px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
  },
  btnDanger: {
    flex: 1,
    padding: "9px 16px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#FFFFFF",
    backgroundColor: "#EF4444",
    cursor: "pointer",
  },
  btnSuccess: {
    flex: 1,
    padding: "9px 16px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#FFFFFF",
    backgroundColor: "#22C55E",
    cursor: "pointer",
  },
  btnAction: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnActionDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    border: "1px solid #FCA5A5",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnActionSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    border: "1px solid #86EFAC",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#15803D",
    backgroundColor: "#F0FDF4",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
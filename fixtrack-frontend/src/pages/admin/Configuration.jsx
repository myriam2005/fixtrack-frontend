// src/pages/admin/Configuration.jsx
import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Dialog, Tooltip, TextField } from '@mui/material';
import { Add as AddIcon, WarningAmber as WarningIcon } from '@mui/icons-material';

// ─── Inline SVG icons ──────────────────────────────────────────────────────────
const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const BrainIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XSmallIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Color palette ─────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  'Électrique':   { dot: '#F59E0B', bg: '#FFFBEB', text: '#D97706' },
  'HVAC':         { dot: '#06B6D4', bg: '#ECFEFF', text: '#0891B2' },
  'Informatique': { dot: '#3B82F6', bg: '#EFF6FF', text: '#2563EB' },
  'Mécanique':    { dot: '#EF4444', bg: '#FEF2F2', text: '#DC2626' },
  'Plomberie':    { dot: '#8B5CF6', bg: '#F5F3FF', text: '#7C3AED' },
  'Sécurité':     { dot: '#22C55E', bg: '#F0FDF4', text: '#16A34A' },
};
const getColor = (nom) => CATEGORY_COLORS[nom] || { dot: '#6B7280', bg: '#F9FAFB', text: '#4B5563' };

// ─── Highlight matching letters in yellow ──────────────────────────────────────
function HighlightText({ text, query }) {
  const q = query.trim();
  if (!q) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span style={{ backgroundColor: '#FEF08A', borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </span>
  );
}

// ─── Reusable dialog ───────────────────────────────────────────────────────────
function FTDialog({ open, onClose, title, subtitle, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.16)', overflow: 'hidden' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mt: '2px' }}>{subtitle}</Typography>}
        </Box>
        <Box component="button" onClick={onClose} sx={{
          width: 32, height: 32, borderRadius: '8px', border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#9CA3AF', transition: 'all 0.15s',
          '&:hover': { backgroundColor: '#F3F4F6', color: '#374151' },
        }}>
          <CloseIcon />
        </Box>
      </Box>
      <Box sx={{ p: '24px' }}>{children}</Box>
    </Dialog>
  );
}

// ─── Shared MUI TextField style ────────────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontSize: '13.5px', backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#D1D5DB' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '13px', color: '#9CA3AF' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
};

const btn = { cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' };

// ══════════════════════════════════════════════════════════════════════════════
export default function Configuration() {

  const [categories, setCategories] = useState([
    { id: 1, nom: 'Électrique',   nombreTickets: 12 },
    { id: 2, nom: 'HVAC',         nombreTickets: 8  },
    { id: 3, nom: 'Informatique', nombreTickets: 15 },
    { id: 4, nom: 'Mécanique',    nombreTickets: 5  },
    { id: 5, nom: 'Plomberie',    nombreTickets: 3  },
  ]);

  const reglesIA = [
    { condition: 'Score ≥ 80',  priorite: 'Critique', couleur: '#EF4444', bg: '#FEF2F2', description: 'Panne majeure affectant plusieurs services' },
    { condition: 'Score 60–79', priorite: 'Haute',    couleur: '#F59E0B', bg: '#FFFBEB', description: 'Intervention urgente requise' },
    { condition: 'Score 40–59', priorite: 'Moyenne',  couleur: '#3B82F6', bg: '#EFF6FF', description: 'À traiter dans les 24h' },
    { condition: 'Score < 40',  priorite: 'Basse',    couleur: '#6B7280', bg: '#F9FAFB', description: 'Maintenance préventive' },
  ];

  const [openAdd,    setOpenAdd]    = useState(false);
  const [openEdit,   setOpenEdit]   = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [inputName,  setInputName]  = useState('');
  const [toast,      setToast]      = useState(null);
  const [search,     setSearch]     = useState('');

  const isFiltering = search.trim().length > 0;

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? categories.filter(c => c.nom.toLowerCase().includes(q)) : categories;
  }, [categories, search]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    if (!inputName.trim()) return;
    setCategories(prev => [...prev, { id: Date.now(), nom: inputName.trim(), nombreTickets: 0 }]);
    setInputName(''); setOpenAdd(false);
    showToast('Catégorie ajoutée avec succès');
  };

  const handleEdit = () => {
    if (!inputName.trim() || !selected) return;
    setCategories(prev => prev.map(c => c.id === selected.id ? { ...c, nom: inputName.trim() } : c));
    setOpenEdit(false); setSelected(null); setInputName('');
    showToast('Catégorie modifiée avec succès');
  };

  const handleDelete = () => {
    if (!selected) return;
    setCategories(prev => prev.filter(c => c.id !== selected.id));
    setOpenDelete(false); setSelected(null);
    showToast('Catégorie supprimée', 'delete');
  };

  const openEditModal   = (cat) => { setSelected(cat); setInputName(cat.nom); setOpenEdit(true); };
  const openDeleteModal = (cat) => { setSelected(cat); setOpenDelete(true); };

  return (
    <Box sx={{ pb: '80px', position: 'relative' }}>

      {/* ── Toast notification ── */}
      {toast && (
        <Box sx={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
          display: 'flex', alignItems: 'center', gap: '10px',
          backgroundColor: '#111827', color: '#FFFFFF',
          borderRadius: '12px', padding: '12px 18px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
          animation: 'fadeUp 0.22s ease',
          '@keyframes fadeUp': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to:   { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: toast.type === 'delete' ? '#EF4444' : '#22C55E', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '13.5px', fontWeight: 500 }}>{toast.msg}</Typography>
        </Box>
      )}

      {/* ── Page header ── */}
      <Box sx={{ mb: '28px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '10px' }}>
          <Box sx={{ width: 28, height: 2, backgroundColor: '#2563EB', borderRadius: 1 }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Administration
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '32px', fontWeight: 800, color: '#111827', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15, letterSpacing: '-0.3px', mb: '6px' }}>
          Configuration
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
          Gérez les catégories de pannes et consultez les règles de priorité IA
        </Typography>
      </Box>

      {/* ── Two-column grid ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: '20px', alignItems: 'start' }}>

        {/* ══════════════════════════════════
            LEFT — Catégories
        ══════════════════════════════════ */}
        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

          {/* Header */}
          <Box sx={{ p: '22px 24px 14px' }}>

            {/* Title row + Add button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <TagIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#111827', lineHeight: 1 }}>
                    Catégories de pannes
                  </Typography>
                  <Typography sx={{ fontSize: '11px', mt: '2px', transition: 'color 0.2s', color: isFiltering ? '#2563EB' : '#9CA3AF' }}>
                    {isFiltering
                      ? `${filteredCategories.length} résultat${filteredCategories.length !== 1 ? 's' : ''} sur ${categories.length}`
                      : `${categories.length} catégories actives`}
                  </Typography>
                </Box>
              </Box>

              <Box component="button" onClick={() => setOpenAdd(true)} sx={{
                ...btn,
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', border: 'none',
                backgroundColor: '#2563EB', color: '#FFFFFF',
                fontSize: '12.5px', fontWeight: 600, flexShrink: 0,
                '&:hover': { backgroundColor: '#1D4ED8', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' },
                '&:active': { transform: 'translateY(0)' },
              }}>
                <AddIcon sx={{ fontSize: 15 }} />
                Ajouter
              </Box>
            </Box>

            {/* ── Smart search bar ── */}
            <Box sx={{ position: 'relative' }}>

              {/* Magnifier icon */}
              <Box sx={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: isFiltering ? '#2563EB' : '#9CA3AF',
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s', pointerEvents: 'none', zIndex: 1,
              }}>
                <SearchIcon />
              </Box>

              {/* Input */}
              <Box
                component="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une catégorie…"
                sx={{
                  width: '100%', boxSizing: 'border-box',
                  height: '40px',
                  pl: '36px',
                  pr: isFiltering ? '64px' : '14px',
                  border: `1.5px solid ${isFiltering ? '#93C5FD' : '#E5E7EB'}`,
                  borderRadius: '10px',
                  backgroundColor: isFiltering ? '#EFF6FF' : '#F9FAFB',
                  fontSize: '13px', color: '#111827',
                  outline: 'none', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  '&::placeholder': { color: '#9CA3AF' },
                  '&:focus': {
                    borderColor: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    boxShadow: '0 0 0 3px rgba(37,99,235,0.1)',
                  },
                }}
              />

              {/* Right-side controls: count pill + clear button */}
              {isFiltering && (
                <Box sx={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {/* Result count pill */}
                  <Box sx={{
                    backgroundColor: filteredCategories.length > 0 ? '#2563EB' : '#EF4444',
                    color: '#FFFFFF', borderRadius: '6px',
                    padding: '1px 7px', fontSize: '11px', fontWeight: 700, lineHeight: '18px',
                    transition: 'background 0.2s',
                  }}>
                    {filteredCategories.length}
                  </Box>

                  {/* Clear × button */}
                  <Box component="button" onClick={() => setSearch('')} sx={{
                    ...btn,
                    width: 20, height: 20, borderRadius: '50%', border: 'none', padding: 0,
                    backgroundColor: '#CBD5E1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
                    '&:hover': { backgroundColor: '#94A3B8' },
                  }}>
                    <XSmallIcon />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Separator */}
          <Box sx={{ height: '1px', backgroundColor: '#F3F4F6' }} />

          {/* ── Category list ── */}
          <Box sx={{ pb: '8px' }}>

            {/* State 1 — no categories exist */}
            {categories.length === 0 && (
              <Box sx={{ textAlign: 'center', py: '44px', px: '24px' }}>
                <Box sx={{ fontSize: '36px', mb: '10px' }}>🏷️</Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151', mb: '4px' }}>Aucune catégorie</Typography>
                <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mb: '16px' }}>Commencez par ajouter une catégorie de panne.</Typography>
                <Box component="button" onClick={() => setOpenAdd(true)} sx={{
                  ...btn,
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
                  '&:hover': { backgroundColor: '#1D4ED8' },
                }}>
                  <AddIcon sx={{ fontSize: 15 }} /> Ajouter une catégorie
                </Box>
              </Box>
            )}

            {/* State 2 — search returned nothing */}
            {categories.length > 0 && filteredCategories.length === 0 && (
              <Box sx={{ textAlign: 'center', py: '40px', px: '24px' }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: '12px', fontSize: '22px',
                }}>🔍</Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151', mb: '4px' }}>
                  Aucun résultat
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mb: '14px' }}>
                  Aucune catégorie ne correspond à{' '}
                  <Box component="span" sx={{ fontWeight: 600, color: '#374151' }}>«&nbsp;{search}&nbsp;»</Box>
                </Typography>
                <Box component="button" onClick={() => setSearch('')} sx={{
                  ...btn,
                  padding: '7px 16px', borderRadius: '9px',
                  border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
                  fontSize: '12.5px', fontWeight: 600, color: '#374151',
                  '&:hover': { backgroundColor: '#F9FAFB' },
                }}>
                  Effacer la recherche
                </Box>
              </Box>
            )}

            {/* State 3 — results */}
            {filteredCategories.map((cat, index) => {
              const clr = getColor(cat.nom);
              return (
                <Box key={cat.id}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    px: '16px', py: '13px',
                    transition: 'background 0.15s',
                    '&:hover': { backgroundColor: '#F8FAFF' },
                    '&:hover .row-actions': { opacity: 1 },
                  }}>
                    {/* Color dot */}
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: clr.dot, boxShadow: `0 0 0 3px ${clr.dot}22` }} />

                    {/* Name with highlight */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: clr.bg, borderRadius: '8px', padding: '4px 10px' }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: clr.text }}>
                          <HighlightText text={cat.nom} query={search} />
                        </Typography>
                      </Box>
                    </Box>

                    {/* Ticket count */}
                    <Box sx={{
                      borderRadius: '20px', padding: '2px 10px',
                      backgroundColor: cat.nombreTickets > 0 ? '#EFF6FF' : '#F9FAFB',
                      border: `1px solid ${cat.nombreTickets > 0 ? '#BFDBFE' : '#E5E7EB'}`,
                    }}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: cat.nombreTickets > 0 ? '#2563EB' : '#9CA3AF' }}>
                        {cat.nombreTickets} ticket{cat.nombreTickets !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {/* Hover actions */}
                    <Box className="row-actions" sx={{ display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.15s' }}>
                      <Tooltip title="Modifier" arrow placement="top">
                        <Box component="button" onClick={() => openEditModal(cat)} sx={{
                          ...btn,
                          width: 30, height: 30, borderRadius: '8px',
                          border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
                          '&:hover': { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' },
                        }}>
                          <PencilIcon />
                        </Box>
                      </Tooltip>
                      <Tooltip title="Supprimer" arrow placement="top">
                        <Box component="button" onClick={() => openDeleteModal(cat)} sx={{
                          ...btn,
                          width: 30, height: 30, borderRadius: '8px',
                          border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
                          '&:hover': { backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#EF4444' },
                        }}>
                          <TrashIcon />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>

                  {index < filteredCategories.length - 1 && (
                    <Box sx={{ height: '1px', backgroundColor: '#F3F4F6', mx: '16px' }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* ══════════════════════════════════
            RIGHT — Règles IA
        ══════════════════════════════════ */}
        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Box sx={{ p: '22px 24px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '18px' }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                <BrainIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#111827', lineHeight: 1 }}>Règles de priorité IA</Typography>
                <Typography sx={{ fontSize: '11px', color: '#9CA3AF', mt: '2px' }}>Lecture seule · 4 règles actives</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reglesIA.map((regle, i) => (
                <Box key={i} sx={{
                  borderRadius: '12px',
                  border: `1px solid ${regle.couleur}22`,
                  backgroundColor: regle.bg,
                  padding: '14px 16px',
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'translateX(3px)' },
                }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: regle.couleur }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '5px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#111827', pl: '4px' }}>
                      {regle.condition}
                    </Typography>
                    <Box sx={{ backgroundColor: `${regle.couleur}18`, border: `1px solid ${regle.couleur}33`, borderRadius: '6px', padding: '2px 8px' }}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: regle.couleur }}>{regle.priorite}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '11.5px', color: '#6B7280', lineHeight: 1.55, pl: '4px' }}>
                    {regle.description}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: '16px', borderRadius: '10px', padding: '12px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <WarningIcon sx={{ fontSize: 16, color: '#F59E0B', mt: '1px', flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#92400E', mb: '3px' }}>Mode lecture seule</Typography>
                <Typography sx={{ fontSize: '11px', color: '#78350F', lineHeight: 1.55 }}>
                  La modification des règles IA sera disponible dans une prochaine version.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ══ MODAL : Ajouter ══ */}
      <FTDialog open={openAdd} onClose={() => { setOpenAdd(false); setInputName(''); }} title="Nouvelle catégorie" subtitle="Ajoutez une catégorie de panne à la plateforme">
        <TextField
          autoFocus fullWidth label="Nom de la catégorie"
          value={inputName} onChange={e => setInputName(e.target.value)}
          placeholder="Ex: Ascenseur, Menuiserie…"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          sx={{ ...fieldSx, mb: '20px' }}
        />
        <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Box component="button" onClick={() => { setOpenAdd(false); setInputName(''); }} sx={{
            ...btn, padding: '9px 18px', borderRadius: '9px', border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 600, color: '#374151',
            '&:hover': { backgroundColor: '#F3F4F6' },
          }}>Annuler</Box>
          <Box component="button" onClick={handleAdd} disabled={!inputName.trim()} sx={{
            ...btn, padding: '9px 18px', borderRadius: '9px', border: 'none',
            backgroundColor: inputName.trim() ? '#2563EB' : '#BFDBFE',
            fontSize: '13px', fontWeight: 600, color: '#FFFFFF',
            cursor: inputName.trim() ? 'pointer' : 'not-allowed',
            '&:hover': inputName.trim() ? { backgroundColor: '#1D4ED8' } : {},
          }}>Ajouter la catégorie</Box>
        </Box>
      </FTDialog>

      {/* ══ MODAL : Modifier ══ */}
      <FTDialog open={openEdit} onClose={() => { setOpenEdit(false); setInputName(''); }} title="Modifier la catégorie" subtitle={selected ? `Édition de « ${selected.nom} »` : ''}>
        <TextField
          autoFocus fullWidth label="Nouveau nom"
          value={inputName} onChange={e => setInputName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEdit()}
          sx={{ ...fieldSx, mb: '20px' }}
        />
        <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Box component="button" onClick={() => { setOpenEdit(false); setInputName(''); }} sx={{
            ...btn, padding: '9px 18px', borderRadius: '9px', border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 600, color: '#374151',
            '&:hover': { backgroundColor: '#F3F4F6' },
          }}>Annuler</Box>
          <Box component="button" onClick={handleEdit} disabled={!inputName.trim()} sx={{
            ...btn, padding: '9px 18px', borderRadius: '9px', border: 'none',
            backgroundColor: inputName.trim() ? '#2563EB' : '#BFDBFE',
            fontSize: '13px', fontWeight: 600, color: '#FFFFFF',
            cursor: inputName.trim() ? 'pointer' : 'not-allowed',
            '&:hover': inputName.trim() ? { backgroundColor: '#1D4ED8' } : {},
          }}>Enregistrer</Box>
        </Box>
      </FTDialog>

      {/* ══ MODAL : Supprimer ══ */}
      <FTDialog open={openDelete} onClose={() => setOpenDelete(false)} title="Supprimer la catégorie ?">
        <Box sx={{ mb: '20px' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '14px' }}>
            <TrashIcon />
          </Box>
          <Typography sx={{ fontSize: '13.5px', color: '#374151', lineHeight: 1.6 }}>
            Vous êtes sur le point de supprimer la catégorie{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>«&nbsp;{selected?.nom}&nbsp;»</Box>.
            Cette action est irréversible.
          </Typography>
          {selected?.nombreTickets > 0 && (
            <Box sx={{ mt: '12px', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WarningIcon sx={{ fontSize: 15, color: '#F59E0B', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '12px', color: '#92400E' }}>
                <strong>{selected.nombreTickets} ticket(s)</strong> seront déplacés vers «&nbsp;Non classé&nbsp;».
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <Box component="button" onClick={() => setOpenDelete(false)} sx={{
            ...btn, flex: 1, padding: '10px', borderRadius: '9px', border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 600, color: '#374151',
            '&:hover': { backgroundColor: '#F3F4F6' },
          }}>Annuler</Box>
          <Box component="button" onClick={handleDelete} sx={{
            ...btn, flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
            backgroundColor: '#EF4444', fontSize: '13px', fontWeight: 700, color: '#FFFFFF',
            '&:hover': { backgroundColor: '#DC2626' }, '&:active': { transform: 'scale(0.98)' },
          }}>Supprimer</Box>
        </Box>
      </FTDialog>
    </Box>
  );
}
import { useState, useMemo } from 'react';
import { 
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, TextField, Chip, Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function Configuration() {

  const [categories, setCategories] = useState([
    { id: 1, nom: 'Électrique',   nombreTickets: 12 },
    { id: 2, nom: 'HVAC',         nombreTickets: 8  },
    { id: 3, nom: 'Informatique', nombreTickets: 15 },
    { id: 4, nom: 'Mécanique',    nombreTickets: 5  },
    { id: 5, nom: 'Plomberie',    nombreTickets: 3  },
  ]);

  const reglesIA = [
    { condition: 'Score ≥ 80',  priorite: 'Critique', couleur: '#EF4444', description: 'Panne majeure affectant plusieurs services' },
    { condition: 'Score 60-79', priorite: 'Haute',    couleur: '#F59E0B', description: 'Intervention urgente requise' },
    { condition: 'Score 40-59', priorite: 'Moyenne',  couleur: '#3B82F6', description: 'À traiter dans les 24h' },
    { condition: 'Score < 40',  priorite: 'Basse',    couleur: '#6B7280', description: 'Maintenance préventive' },
  ];

  const [search, setSearch]                     = useState('');
  const [openAdd, setOpenAdd]                   = useState(false);
  const [openEdit, setOpenEdit]                 = useState(false);
  const [openDelete, setOpenDelete]             = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName]   = useState('');
  const [successMessage, setSuccessMessage]     = useState('');

  const filteredCategories = useMemo(() =>
    categories.filter(c => c.nom.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const totalTickets = categories.reduce((sum, c) => sum + c.nombreTickets, 0);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories([...categories, {
      id: Math.max(...categories.map(c => c.id)) + 1,
      nom: newCategoryName.trim(),
      nombreTickets: 0,
    }]);
    setNewCategoryName('');
    setOpenAdd(false);
    showSuccess('Catégorie ajoutée avec succès');
  };

  const handleEditCategory = () => {
    if (!newCategoryName.trim() || !selectedCategory) return;
    setCategories(categories.map(cat =>
      cat.id === selectedCategory.id ? { ...cat, nom: newCategoryName.trim() } : cat
    ));
    setOpenEdit(false);
    setSelectedCategory(null);
    setNewCategoryName('');
    showSuccess('Catégorie modifiée avec succès');
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
    setOpenDelete(false);
    setSelectedCategory(null);
    showSuccess('Catégorie supprimée avec succès');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const openEditModal   = (cat) => { setSelectedCategory(cat); setNewCategoryName(cat.nom); setOpenEdit(true); };
  const openDeleteModal = (cat) => { setSelectedCategory(cat); setOpenDelete(true); };

  return (
    <Box>

      <Typography sx={{
        fontSize: '18px', fontWeight: 800, color: '#0F172A',
        letterSpacing: '-0.5px', margin: '0 0 24px',
        fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15,
      }}>
        Gérer les catégories et les règles de priorité
      </Typography>

      {successMessage && (
        <Alert severity="success" icon={<CheckCircleIcon />}
          sx={{ marginBottom: 2, borderRadius: '8px', border: '1px solid #BBF7D0' }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={2}>

        {/* ── Catégories ── */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{
            borderRadius: '14px', border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <Box sx={{ padding: '20px 24px' }}>

              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                    Catégories de pannes
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#9CA3AF', mt: '2px' }}>
                    {categories.length} catégories au total
                  </Typography>
                </Box>
                <Box sx={{ '& button': { padding: '4px 12px !important', fontSize: '12px !important', minWidth: 'auto !important' } }}>
                  <Button label="+ Ajouter" variant="primary" onClick={() => setOpenAdd(true)} />
                </Box>
              </Box>

              {/* ✅ Barre de recherche */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                mb: 2, padding: '8px 12px',
                border: '1px solid #E5E7EB', borderRadius: '8px',
                backgroundColor: '#F9FAFB',
                transition: 'all 0.15s',
                '&:focus-within': { borderColor: '#2563EB', backgroundColor: '#FFFFFF' },
              }}>
                <SearchIcon sx={{ fontSize: 16, color: '#9CA3AF', flexShrink: 0 }} />
                <TextField
                  placeholder="Rechercher une catégorie..."
                  variant="standard"
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    '& input': { fontSize: '13px', color: '#374151', padding: 0 },
                    '& input::placeholder': { color: '#9CA3AF' },
                  }}
                />
                {search && (
                  <Box onClick={() => setSearch('')} sx={{ cursor: 'pointer', color: '#9CA3AF', fontSize: '18px', lineHeight: 1, '&:hover': { color: '#6B7280' } }}>
                    ×
                  </Box>
                )}
              </Box>

              {/* Résultat recherche */}
              {search && (
                <Typography sx={{ fontSize: '11px', color: '#9CA3AF', mb: 1 }}>
                  {filteredCategories.length} résultat{filteredCategories.length !== 1 ? 's' : ''} pour « {search} »
                </Typography>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px solid #F3F4F6' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 8px' }}>
                        Catégorie
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 8px' }}>
                        Tickets
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 8px' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '13px' }}>
                          Aucune catégorie trouvée pour « {search} »
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow key={category.id}
                          sx={{ borderBottom: '1px solid #F9FAFB', '&:hover': { backgroundColor: '#F9FAFB' } }}
                        >
                          <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#111827', padding: '16px 8px' }}>
                            {category.nom}
                          </TableCell>
                          <TableCell align="center" sx={{ padding: '16px 8px' }}>
                            <Chip label={category.nombreTickets} size="small"
                              sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '12px' }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ padding: '16px 8px' }}>
                            <IconButton size="small" onClick={() => openEditModal(category)}
                              sx={{ color: '#3B82F6', '&:hover': { backgroundColor: '#EFF6FF' } }}>
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => openDeleteModal(category)}
                              sx={{ color: '#EF4444', marginLeft: '4px', '&:hover': { backgroundColor: '#FEF2F2' } }}>
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ✅ Compteur total */}
              <Box sx={{
                mt: 2, pt: 2, borderTop: '1px solid #F3F4F6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
               
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                  <Typography sx={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                    {totalTickets} tickets répartis
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Paper>
        </Grid>

        {/* ── Règles IA ── */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{
            borderRadius: '14px', border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <Box sx={{ padding: '20px 24px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827', mb: 1 }}>
                Règles de priorité IA
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mb: 3 }}>
                Affichage des règles actuelles (lecture seule)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {reglesIA.map((regle, index) => (
                  <Box key={index} sx={{
                    border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px',
                    background: 'linear-gradient(to right, #FFFFFF 0%, #F9FAFB 100%)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: regle.couleur }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                        {regle.condition}
                      </Typography>
                      <Chip label={regle.priorite} size="small" sx={{
                        backgroundColor: `${regle.couleur}15`, color: regle.couleur,
                        fontWeight: 700, fontSize: '11px', borderRadius: '6px',
                      }} />
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.5 }}>
                      {regle.description}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, padding: 2, background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <WarningIcon sx={{ fontSize: 18, color: '#F59E0B', mt: '2px' }} />
                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#92400E', mb: '4px' }}>
                      Mode lecture seule
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#78350F', lineHeight: 1.5 }}>
                      Les règles de priorité IA ne peuvent pas être modifiées pour le moment. Cette fonctionnalité sera disponible dans une prochaine version.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Modals */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Ajouter une catégorie">
        <TextField autoFocus margin="dense" label="Nom de la catégorie" fullWidth variant="outlined"
          value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Ex: Ascenseur" sx={{ mt: 1, mb: 3 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button label="Annuler" variant="secondary" onClick={() => setOpenAdd(false)} />
          <Button label="Ajouter" variant="primary"   onClick={handleAddCategory} disabled={!newCategoryName.trim()} />
        </Box>
      </Modal>

      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Modifier la catégorie">
        <TextField autoFocus margin="dense" label="Nom de la catégorie" fullWidth variant="outlined"
          value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
          sx={{ mt: 1, mb: 3 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button label="Annuler"  variant="secondary" onClick={() => setOpenEdit(false)} />
          <Button label="Modifier" variant="primary"   onClick={handleEditCategory} disabled={!newCategoryName.trim()} />
        </Box>
      </Modal>

      <Modal open={openDelete} onClose={() => setOpenDelete(false)} title="Supprimer la catégorie ?">
        <Typography sx={{ fontSize: '14px', color: '#6B7280', mb: 2 }}>
          Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{selectedCategory?.nom}"</strong> ?
        </Typography>
        {selectedCategory?.nombreTickets > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
            Cette catégorie contient {selectedCategory.nombreTickets} ticket(s). Ils seront déplacés vers "Non classé".
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button label="Annuler"   variant="secondary" onClick={() => setOpenDelete(false)} />
          <Button label="Supprimer" variant="danger"    onClick={handleDeleteCategory} />
        </Box>
      </Modal>

    </Box>
  );
}
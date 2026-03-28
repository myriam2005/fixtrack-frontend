// src/TestComponents.jsx
import { useState } from 'react';
import { Grid, Paper, Typography, Divider, Box } from '@mui/material';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import Modal from './components/common/Modal';
import SkeletonLoader from './components/common/SkeletonLoader';
import StarRating from './components/common/StarRating';
import Timeline from './components/common/Timeline';

export default function TestComponents() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(0);

  // Données exemple pour la timeline
  const sampleEvents = [
    {
      date: new Date(2024, 1, 15, 10, 30),
      action: "Ticket créé",
      auteur: "Oumayma"
    },
    {
      date: new Date(2024, 1, 15, 14, 45),
      action: "Assigné à l'équipe technique",
      auteur: "Support"
    },
    {
      date: new Date(2024, 1, 16, 9, 15),
      action: "En cours de traitement",
      auteur: "Technicien"
    },
    {
      date: new Date(2024, 1, 16, 16, 30),
      action: "Résolu",
      auteur: "Technicien"
    }
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* En-tête */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#2563EB', color: 'white' }}>
        <Typography variant="h4" align="center" gutterBottom>
          🧪 Test des Composants Communs
        </Typography>
        <Typography variant="subtitle1" align="center">
          Badge • Button • SkeletonLoader • Modal • StarRating • Timeline
        </Typography>
      </Paper>

      {/* Section 1: Badges */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>📌</span> Badges (Étiquettes)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle2" gutterBottom>Statuts tickets :</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item><Badge status="open" /></Grid>
          <Grid item><Badge status="assigned" /></Grid>
          <Grid item><Badge status="in_progress" /></Grid>
          <Grid item><Badge status="pending" /></Grid>
          <Grid item><Badge status="resolved" /></Grid>
          <Grid item><Badge status="closed" /></Grid>
        </Grid>

        <Typography variant="subtitle2" gutterBottom>Priorités :</Typography>
        <Grid container spacing={2}>
          <Grid item><Badge status="critical" /></Grid>
          <Grid item><Badge status="high" /></Grid>
          <Grid item><Badge status="medium" /></Grid>
          <Grid item><Badge status="low" /></Grid>
        </Grid>
      </Paper>

      {/* Section 2: Boutons */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>🔘</span> Boutons
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} alignItems="center">
          <Grid item><Button label="Primary" variant="primary" onClick={() => alert('Primary cliqué')} /></Grid>
          <Grid item><Button label="Secondary" variant="secondary" onClick={() => alert('Secondary cliqué')} /></Grid>
          <Grid item><Button label="Danger" variant="danger" onClick={() => alert('Danger cliqué')} /></Grid>
          <Grid item><Button label="Désactivé" disabled onClick={() => alert('Désactivé')} /></Grid>
        </Grid>
      </Paper>

      {/* Section 3: Loading Spinner */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>⏳</span> Loading Spinner
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4} alignItems="center">
          <Grid item><SkeletonLoader type="line" height={30} /></Grid>
          <Grid item><SkeletonLoader type="line" height={50} /></Grid>
          <Grid item><SkeletonLoader type="line" height={70} /></Grid>
          <Grid item><Typography variant="body2">Différentes tailles</Typography></Grid>
        </Grid>
      </Paper>

      {/* Section 4: Modal */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>📦</span> Modal (Fenêtre modale)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Button 
          label="Ouvrir la modal" 
          variant="primary"
          onClick={() => setModalOpen(true)} 
        />
        
        <Modal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          title="Exemple de Modal"
        >
          <Typography variant="body1" paragraph>
            Ceci est une fenêtre modale. Vous pouvez y mettre :
          </Typography>
          <ul>
            <li>Du texte</li>
            <li>Des formulaires</li>
            <li>Des confirmations</li>
            <li>D'autres composants</li>
          </ul>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              label="Fermer" 
              variant="secondary" 
              onClick={() => setModalOpen(false)} 
            />
          </Box>
        </Modal>
      </Paper>

      {/* Section 5: StarRating (Nouveau) */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>⭐</span> StarRating (Évaluation par étoiles)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body2" gutterBottom>
          Note sélectionnée : <strong>{rating}/5</strong>
        </Typography>
        <StarRating 
          onRate={(value) => setRating(value)}
          initialRating={0}
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
          Cliquez sur une étoile pour noter • Survolez pour voir l'effet
        </Typography>
      </Paper>

      {/* Section 6: Timeline (Nouveau) */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>📅</span> Timeline (Historique)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Timeline events={sampleEvents} />
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
          Affiche l'historique des événements avec dates et auteurs
        </Typography>
      </Paper>

      {/* Footer avec résumé */}
      <Paper elevation={1} sx={{ p: 2, backgroundColor: '#e0e0e0' }}>
        <Typography variant="body2" align="center">
          ✅ 6 composants fonctionnels : Badge, Button, SkeletonLoader, Modal, StarRating, Timeline
        </Typography>
      </Paper>
    </Box>
  );
}
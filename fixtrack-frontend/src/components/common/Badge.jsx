import { Chip } from '@mui/material';

export default function Badge({ status }) {
  const getColor = () => {
    const colors = {
      // Statuts tickets
      open: { bg: '#3B82F6', text: '#FFFFFF' },
      assigned: { bg: '#3B82F6', text: '#FFFFFF' },
      in_progress: { bg: '#F59E0B', text: '#FFFFFF' },
      pending: { bg: '#F59E0B', text: '#FFFFFF' },
      resolved: { bg: '#22C55E', text: '#FFFFFF' },
      closed: { bg: '#6B7280', text: '#FFFFFF' },
      
      // Priorités
      critical: { bg: '#EF4444', text: '#FFFFFF' },
      high: { bg: '#F59E0B', text: '#FFFFFF' },
      medium: { bg: '#3B82F6', text: '#FFFFFF' },
      low: { bg: '#6B7280', text: '#FFFFFF' },
    };
    
    return colors[status] || { bg: '#E5E7EB', text: '#111827' };
  };

  const getLabel = () => {
    const labels = {
      open: 'Ouvert',
      assigned: 'Assigné',
      in_progress: 'En cours',
      pending: 'En attente',
      resolved: 'Résolu',
      closed: 'Clôturé',
      critical: 'Critique',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
    };
    
    return labels[status] || status;
  };

  const colors = getColor();

  return (
    <Chip
      label={getLabel()}
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 600,
        fontSize: '12px',
        borderRadius: '8px',
        height: '24px',
      }}
    />
  );
}
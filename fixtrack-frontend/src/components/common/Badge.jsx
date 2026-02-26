// src/components/common/Badge.jsx
import { Chip } from '@mui/material';

export default function Badge({ status }) {
  const getColor = () => {
    const colors = {
      // ── Statuts tickets ──────────────────────────────
      open:        { bg: '#3B82F6', text: '#FFFFFF' },
      assigned:    { bg: '#6366F1', text: '#FFFFFF' },
      in_progress: { bg: '#F59E0B', text: '#FFFFFF' },
      pending:     { bg: '#F59E0B', text: '#FFFFFF' },
      resolved:    { bg: '#22C55E', text: '#FFFFFF' },
      closed:      { bg: '#6B7280', text: '#FFFFFF' },

      // ── Priorités ────────────────────────────────────
      critical:    { bg: '#EF4444', text: '#FFFFFF' },
      high:        { bg: '#F97316', text: '#FFFFFF' },
      medium:      { bg: '#3B82F6', text: '#FFFFFF' },
      low:         { bg: '#6B7280', text: '#FFFFFF' },

      // ── Statuts machines (natifs mockData) ───────────
      en_service:     { bg: '#22C55E', text: '#FFFFFF' },
      en_panne:       { bg: '#EF4444', text: '#FFFFFF' },
      en_maintenance: { bg: '#F59E0B', text: '#FFFFFF' },
    };

    return colors[status] || { bg: '#E5E7EB', text: '#111827' };
  };

  const getLabel = () => {
    const labels = {
      // Statuts tickets
      open:        'Ouvert',
      assigned:    'Assigné',
      in_progress: 'En cours',
      pending:     'En attente',
      resolved:    'Résolu',
      closed:      'Clôturé',

      // Priorités
      critical: 'Critique',
      high:     'Haute',
      medium:   'Moyenne',
      low:      'Basse',

      // Statuts machines
      en_service:     'En service',
      en_panne:       'En panne',
      en_maintenance: 'En maintenance',
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
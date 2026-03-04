import { Card, CardContent, Box, Typography } from '@mui/material';

export default function KpiCard({ icon: Icon, value, label, color = '#2563EB', bgColor, description, trend }) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        borderBottom: `3px solid ${color}`,
        transition: 'all 0.2s',
        height: '100%',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ padding: '20px 24px !important' }}>

        {/* Ligne haut : label + icône */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '12px' }}>
          <Typography sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}>
            {label}
          </Typography>

          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '9px',
            backgroundColor: bgColor || `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon sx={{ fontSize: 20, color }} />
          </Box>
        </Box>

        {/* Valeur */}
        <Typography sx={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1,
          mb: '6px',
        }}>
          {value}
        </Typography>

        {/* Description */}
        {description && (
          <Typography sx={{
            fontSize: '12px',
            color: '#9CA3AF',
            fontWeight: 400,
            lineHeight: 1.4,
          }}>
            {description}
          </Typography>
        )}

        {/* Trend optionnel */}
        {trend && (
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            mt: '10px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: trend.type === 'up' ? '#DCFCE7' : '#FEE2E2',
            color: trend.type === 'up' ? '#16A34A' : '#DC2626',
            fontSize: '11px',
            fontWeight: 600,
          }}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.value}
          </Box>
        )}

      </CardContent>
    </Card>
  );
}
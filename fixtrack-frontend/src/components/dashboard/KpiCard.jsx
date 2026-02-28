import { Card, CardContent, Box, Typography } from '@mui/material';

export default function KpiCard({ icon: Icon, value, label, color = '#2563EB', trend }) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        borderBottom: `3px solid ${color}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ padding: '12px 16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Icône */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22, color }} />
          </Box>

          {/* Label + Valeur */}
          <Box>
            <Typography
              sx={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#6B7280',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1,
              }}
            >
              {value}
            </Typography>
          </Box>

          {/* Trend optionnel */}
          {trend && (
            <Box
              sx={{
                marginLeft: 'auto',
                padding: '3px 8px',
                borderRadius: '6px',
                background: trend.type === 'up' ? '#DCFCE7' : '#FEE2E2',
                color: trend.type === 'up' ? '#16A34A' : '#DC2626',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {trend.type === 'up' ? '↑' : '↓'} {trend.value}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
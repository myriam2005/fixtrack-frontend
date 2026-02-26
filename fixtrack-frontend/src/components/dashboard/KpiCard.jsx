import { Card, CardContent, Box, Typography } from '@mui/material';

export default function KpiCard({ icon: Icon, value, label, color = '#2563EB', trend }) {
  return (
    <Card 
      sx={{ 
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        transition: 'all 0.2s',
        height: '100%',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ padding: '24px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Left: Icon + Data */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon sx={{ fontSize: 28, color }} />
            </Box>
            
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#111827',
                  fontSize: '32px',
                  lineHeight: 1,
                  marginBottom: '4px'
                }}
              >
                {value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {label}
              </Typography>
            </Box>
          </Box>

          {/* Right: Trend (optional) */}
          {trend && (
            <Box
              sx={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: trend.type === 'up' ? '#DCFCE7' : '#FEE2E2',
                color: trend.type === 'up' ? '#16A34A' : '#DC2626',
                fontSize: '12px',
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
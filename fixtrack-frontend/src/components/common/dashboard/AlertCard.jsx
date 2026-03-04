import { Card, CardContent, Box, Typography } from '@mui/material';
import Badge from '../common/badge/Badge';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function AlertCard({ ticket }) {
  return (
    <Card 
      sx={{ 
        borderRadius: '8px',
        border: '2px solid #FEE2E2',
        background: '#FEF2F2',
        marginBottom: '12px',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(239,68,68,0.2)',
        }
      }}
    >
      <CardContent sx={{ padding: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 22, color: '#EF4444' }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: '4px' }}>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}
              >
                {ticket.titre}
              </Typography>
              <Badge status={ticket.priorite} />
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ color: '#6B7280', fontSize: '13px', marginBottom: '8px' }}
            >
              {ticket.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                🔴 NON ASSIGNÉ
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '12px' }}>
                Machine: {ticket.machineId}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
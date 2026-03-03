import { Box, Typography } from '@mui/material';

export default function Timeline({ events }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ paddingLeft: '20px' }}>
      {events.map((event, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            marginBottom: '24px', 
            position: 'relative' 
          }}
        >
          {/* Point coloré */}
          <Box
            sx={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              marginRight: '16px',
              marginTop: '4px',
              zIndex: 1
            }}
          />
          
          {/* Ligne verticale */}
          {index < events.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: '5px',
                top: '16px',
                width: '2px',
                height: 'calc(100% + 8px)',
                backgroundColor: '#E5E7EB'
              }}
            />
          )}
          
          {/* Contenu */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant='body2' 
              sx={{ color: '#6B7280', fontSize: '12px' }}
            >
              {formatDate(event.date)}
            </Typography>
            
            <Typography 
              variant='body1' 
              sx={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}
            >
              {event.action}
            </Typography>
            
            <Typography 
              variant='body2' 
              sx={{ color: '#6B7280', marginTop: '2px' }}
            >
              Par {event.auteur}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
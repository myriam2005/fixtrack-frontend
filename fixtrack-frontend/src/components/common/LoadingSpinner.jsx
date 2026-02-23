import { CircularProgress, Box } from '@mui/material';

export default function LoadingSpinner({ size = 40 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}
    >
      <CircularProgress 
        size={size} 
        sx={{ color: '#2563EB' }} 
      />
    </Box>
  );
}

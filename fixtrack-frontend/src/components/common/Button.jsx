import { Button as MuiButton } from '@mui/material';

export default function Button({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  fullWidth = false 
}) {
  const getVariant = () => {
    if (variant === 'primary') return 'contained';
    if (variant === 'secondary') return 'outlined';
    if (variant === 'danger') return 'contained';
    return 'contained';
  };

  const getColor = () => {
    if (variant === 'danger') return 'error';
    if (variant === 'secondary') return 'primary';
    return 'primary';
  };

  return (
    <MuiButton
      variant={getVariant()}
      color={getColor()}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      sx={{ 
        borderRadius: '8px', 
        textTransform: 'none', 
        fontWeight: 600,
        padding: '10px 24px'
      }}
    >
      {label}
    </MuiButton>
  );
}
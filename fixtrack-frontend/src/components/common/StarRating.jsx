import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function StarRating({ onRate, initialRating = 0 }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    setRating(value);
    if (onRate) {
      onRate(value);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {star <= (hover || rating) ? (
              <StarIcon 
                sx={{ 
                  color: '#F59E0B', 
                  fontSize: '32px',
                  transition: 'all 0.2s'
                }} 
              />
            ) : (
              <StarBorderIcon 
                sx={{ 
                  color: '#E5E7EB', 
                  fontSize: '32px',
                  transition: 'all 0.2s'
                }} 
              />
            )}
          </Box>
        ))}
        
        {rating > 0 && (
          <Typography 
            variant="body2" 
            sx={{ marginLeft: '12px', color: '#6B7280', fontWeight: 600 }}
          >
            {rating}/5
          </Typography>
        )}
      </Box>
    </Box>
  );
}
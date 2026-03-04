// src/components/common/Badge.jsx
import { TOKENS, LABELS } from '../badge/BadgeConstants';

export default function Badge({ status }) {
  const token = TOKENS[status] || { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
  const label = LABELS[status] || status;

  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '5px',
      padding:       '3px 9px',
      borderRadius:  '20px',
      border:        `1px solid ${token.border}`,
      background:    token.bg,
      color:         token.text,
      fontSize:      '11px',
      fontWeight:    600,
      letterSpacing: '0.02em',
      whiteSpace:    'nowrap',
      fontFamily:    'inherit',
      lineHeight:    1,
    }}>
      <span style={{
        width:        '5px',
        height:       '5px',
        borderRadius: '50%',
        background:   token.dot,
        flexShrink:   0,
      }} />
      {label}
    </span>
  );
}
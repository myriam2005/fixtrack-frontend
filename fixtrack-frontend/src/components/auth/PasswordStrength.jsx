// src/components/auth/PasswordStrength.jsx
import LinearProgress from "@mui/material/LinearProgress";
import { getPasswordStrength } from "../../utils/passwordUtils";
import styles from "../../pages/auth/auth.module.css";

const TEXT_COLORS = {
  error:   "#EF4444",
  warning: "#F59E0B",
  info:    "#3B82F6",
  success: "#22C55E",
};

export default function PasswordStrength({ password }) {
  const { label, color, pct } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className={styles.strengthWrap}>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 4, borderRadius: 100, backgroundColor: "#E5E7EB" }}
      />
      <p
        className={styles.strengthLabel}
        style={{ color: TEXT_COLORS[color] }}
      >
        {label}
      </p>
    </div>
  );
}
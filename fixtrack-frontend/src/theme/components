// src/theme/components.js
// ─────────────────────────────────────────────────────────────
//  FixTrack — Overrides composants Material UI
// ─────────────────────────────────────────────────────────────

export const components = {
  // ── BUTTON ──────────────────────────────────────────────
  MuiButton: {
    defaultProps: {
      disableElevation: false,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        fontSize: "0.9375rem",
        padding: "10px 22px",
        transition: "all 0.2s ease",
      },
      containedPrimary: {
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
        "&:hover": {
          background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
          boxShadow: "0 6px 20px rgba(37, 99, 235, 0.45)",
          transform: "translateY(-1px)",
        },
        "&:active": { transform: "translateY(0)" },
        "&.Mui-disabled": {
          background: "#E5E7EB",
          color: "#9CA3AF",
          boxShadow: "none",
        },
      },
      outlinedPrimary: {
        borderColor: "#2563EB",
        "&:hover": {
          background: "rgba(37,99,235,0.06)",
          borderColor: "#1D4ED8",
        },
      },
      sizeLarge: { padding: "13px 28px", fontSize: "1rem" },
      sizeSmall: { padding: "6px 14px",  fontSize: "0.8125rem" },
    },
  },

  // ── TEXT FIELD ───────────────────────────────────────────
  MuiTextField: {
    defaultProps: { variant: "outlined", size: "medium" },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: "#F9FAFB",
        fontSize: "0.9375rem",
        transition: "background 0.2s",
        "& fieldset": { borderColor: "#E5E7EB", transition: "border-color 0.2s" },
        "&:hover fieldset":    { borderColor: "#93C5FD" },
        "&.Mui-focused":       { backgroundColor: "#FFFFFF" },
        "&.Mui-focused fieldset": {
          borderColor: "#2563EB",
          borderWidth: "1.5px",
        },
        "&.Mui-error fieldset": { borderColor: "#EF4444" },
      },
      input: {
        padding: "11px 14px",
        "&::placeholder": { color: "#9CA3AF", opacity: 1 },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#374151",
        "&.Mui-focused": { color: "#2563EB" },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: { fontSize: "0.75rem", marginTop: 4, marginLeft: 0 },
    },
  },

  // ── SELECT ───────────────────────────────────────────────
  MuiSelect: {
    styleOverrides: {
      root: { borderRadius: 8 },
      select: { backgroundColor: "#F9FAFB" },
    },
  },

  // ── PAPER ────────────────────────────────────────────────
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: "none",
      },
      elevation1: {
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
      },
      elevation2: {
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      },
      elevation3: {
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },

  // ── CARD ─────────────────────────────────────────────────
  MuiCard: {
    defaultProps: { elevation: 1 },
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: "1px solid #E5E7EB",
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 20,
        "&:last-child": { paddingBottom: 20 },
      },
    },
  },

  // ── CHIP ─────────────────────────────────────────────────
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 600,
        fontSize: "0.75rem",
      },
    },
  },

  // ── DIVIDER ──────────────────────────────────────────────
  MuiDivider: {
    styleOverrides: {
      root: { borderColor: "#E5E7EB" },
    },
  },

  // ── CHECKBOX ─────────────────────────────────────────────
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: "#D1D5DB",
        "&.Mui-checked": { color: "#2563EB" },
        padding: 6,
      },
    },
  },

  // ── LINEAR PROGRESS ─────────────────────────────────────
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 100,
        height: 4,
        backgroundColor: "#E5E7EB",
      },
      bar: { borderRadius: 100 },
    },
  },

  // ── ALERT ────────────────────────────────────────────────
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 8, fontSize: "0.875rem" },
      standardError:   { backgroundColor: "#FEF2F2", color: "#B91C1C" },
      standardSuccess: { backgroundColor: "#F0FDF4", color: "#15803D" },
      standardInfo:    { backgroundColor: "#EFF6FF", color: "#1D4ED8" },
      standardWarning: { backgroundColor: "#FFFBEB", color: "#92400E" },
    },
  },

  // ── CIRCULAR PROGRESS ────────────────────────────────────
  MuiCircularProgress: {
    defaultProps: { size: 22, thickness: 4 },
  },

  // ── SNACKBAR ─────────────────────────────────────────────
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      autoHideDuration: 3500,
    },
  },

  // ── TOOLTIP ──────────────────────────────────────────────
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: "#1E293B",
        fontSize: "0.75rem",
        borderRadius: 6,
        padding: "6px 10px",
      },
    },
  },

  // ── CSS BASELINE ─────────────────────────────────────────
  MuiCssBaseline: {
    styleOverrides: {
      "*": { boxSizing: "border-box" },
      body: {
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#F3F4F6",
        margin: 0,
        padding: 0,
      },
      "input:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 100px #F9FAFB inset",
        WebkitTextFillColor: "#111827",
      },
      "::-webkit-scrollbar": { width: 5 },
      "::-webkit-scrollbar-track": { background: "transparent" },
      "::-webkit-scrollbar-thumb": {
        background: "#D1D5DB",
        borderRadius: 100,
      },
    },
  },
};
// src/theme/index.js
// ─────────────────────────────────────────────────────────────
//  FixTrack — Point d'entrée du thème MUI
//  Usage : import theme from "@/theme"
// ─────────────────────────────────────────────────────────────

import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";
import { components } from "./components";

const theme = createTheme({
  palette,
  typography,
  components,
  shape: { borderRadius: 8 },
  spacing: 8, // 1 unit = 8px
  breakpoints: {
    values: { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280 },
  },
  zIndex: {
    sidebar: 1100,
    topbar: 1200,
    modal: 1300,
    toast: 1400,
  },
});

export default theme;

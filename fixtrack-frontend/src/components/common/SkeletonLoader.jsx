import { Box } from "@mui/material";

/**
 * SkeletonLoader - Composant centralisé pour les états de chargement
 * 
 * Props:
 * - type: 'line' | 'row' | 'card' | 'block' (défaut: 'line')
 * - height: hauteur en px (défaut: 20)
 * - width: largeur en % ou px (défaut: '100%')
 * - count: nombre de squelettes à afficher (défaut: 1)
 * - gap: espacement entre les squelettes en px (défaut: 12)
 * - mb: margin-bottom en px (défaut: 0)
 * - br: border-radius en px (défaut: 8)
 */
export default function SkeletonLoader({
  type = "line",
  height = 20,
  width = "100%",
  count = 1,
  gap = 12,
  mb = 0,
  br = 8,
}) {
  // Styles de base pour l'animation pulse
  const baseStyle = {
    backgroundColor: "#F1F5F9",
    animation: "pulse 1.5s ease-in-out infinite",
    "@keyframes pulse": {
      "0%,100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
  };

  // ── Line skeleton (simple ligne) ──────────────────────────────────────────
  if (type === "line") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Box
            key={i}
            sx={{
              ...baseStyle,
              height: `${height}px`,
              width,
              borderRadius: `${br}px`,
              mb: i === count - 1 ? `${mb}px` : 0,
            }}
          />
        ))}
      </Box>
    );
  }

  // ── Row skeleton (table row - 7 colonnes) ──────────────────────────────────
  if (type === "row") {
    return (
      <Box>
        {Array.from({ length: count }).map((_, rowIdx) => (
          <Box
            key={rowIdx}
            sx={{
              display: "flex",
              gap: "14px",
              padding: "14px 16px",
              borderBottom: "1px solid #F3F4F6",
              "&:last-child": { borderBottom: "none" },
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((colIdx) => (
              <Box
                key={colIdx}
                sx={{
                  ...baseStyle,
                  height: `${height}px`,
                  flex: colIdx === 3 ? 1 : "0 0 110px",
                  borderRadius: `${br}px`,
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  // ── Card skeleton (bloc carré) ──────────────────────────────────────────────
  if (type === "card") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: `${gap}px`,
          mb: `${mb}px`,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Box
            key={i}
            sx={{
              ...baseStyle,
              height: `${height}px`,
              width: "100%",
              borderRadius: `${br}px`,
            }}
          />
        ))}
      </Box>
    );
  }

  // ── Block skeleton (bloc gris simple) ────────────────────────────────────────
  if (type === "block") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: `${gap}px`,
          mb: `${mb}px`,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Box
            key={i}
            sx={{
              ...baseStyle,
              height: `${height}px`,
              width,
              borderRadius: `${br}px`,
            }}
          />
        ))}
      </Box>
    );
  }

  return null;
}

export const COLORS = {
  // Core palette
  bg: "#0F0E0E",
  surface: "#1A1917",
  surfaceElevated: "#242220",
  border: "#2E2B27",

  // Gold accent
  gold: "#C9A84C",
  goldLight: "#E8D19A",
  goldDark: "#9A7A2E",

  // Text
  text: "#F5F0E8",
  textMuted: "#A09880",
  textDim: "#5C5648",

  // Semantic
  success: "#4CAF9A",
  error: "#E07060",
  warning: "#E8A84C",

  // Category pills
  starters: "#8B6DBE",
  mains: "#4C9CBE",
  desserts: "#BE6D8B",
  beverages: "#4CAF9A",
} as const;

export const FONTS = {
  regular: { fontWeight: "400" as const },
  medium: { fontWeight: "500" as const },
  semibold: { fontWeight: "600" as const },
  bold: { fontWeight: "700" as const },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  all: { label: "All", color: COLORS.gold, icon: "restaurant" },
  starters: { label: "Starters", color: COLORS.starters, icon: "leaf" },
  mains: { label: "Mains", color: COLORS.mains, icon: "flame" },
  desserts: { label: "Desserts", color: COLORS.desserts, icon: "ice-cream" },
  beverages: { label: "Drinks", color: COLORS.beverages, icon: "wine" },
};

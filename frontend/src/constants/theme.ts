import { Platform } from "react-native";

export const COLORS = {
  // A warm, paper-on-walnut bistro palette (less "AI dark mode")
  bg: "#15110D",
  surface: "#1E1813",
  surfaceElevated: "#2A211A",
  border: "#3A2F25",
  hairline: "#5A4636",

  // Burnished brass accent
  gold: "#C9A24A",
  goldLight: "#E6CD86",
  goldDark: "#876119",

  // Cream-on-paper text
  text: "#F2E8D4",
  textMuted: "#B5A687",
  textDim: "#7A6A52",

  // Semantic
  success: "#7FAF7A",
  error: "#C76E5E",
  warning: "#D6A24A",

  // Category accents (used sparingly)
  starters: "#A48566",
  mains: "#B97B4A",
  desserts: "#D08A8A",
  beverages: "#7CA89A",
} as const;

export const FONTS = {
  regular: { fontWeight: "400" as const },
  medium: { fontWeight: "500" as const },
  semibold: { fontWeight: "600" as const },
  bold: { fontWeight: "700" as const },
};

export const FONT_FAMILY = {
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
  serifBold: Platform.select({ ios: "Georgia-Bold", android: "serif", default: "Georgia" }),
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

export const CATEGORY_META: Record<string, { label: string; tagline: string; color: string }> = {
  all: {
    label: "All",
    tagline: "The full bill of fare",
    color: COLORS.gold,
  },
  starters: {
    label: "To Begin",
    tagline: "Small plates & openers",
    color: COLORS.starters,
  },
  mains: {
    label: "From the Hearth",
    tagline: "Plated mains & comforts",
    color: COLORS.mains,
  },
  desserts: {
    label: "Sweets",
    tagline: "House-made desserts",
    color: COLORS.desserts,
  },
  beverages: {
    label: "Cellar & Bar",
    tagline: "Wine, beer & pours",
    color: COLORS.beverages,
  },
};

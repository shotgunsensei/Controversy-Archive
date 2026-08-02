/**
 * Semantic design tokens for the Source of Truth mobile app.
 *
 * Mirrors the web archive's OperatorOS x Shotgun Ninjas studio theme
 * (artifacts/archive/src/index.css): navy-black surfaces, cyan primary,
 * violet secondary, signal-red destructive. The web app is forced-dark, so
 * the same palette is used for both the `light` and `dark` keys — the app
 * always renders in the studio aesthetic regardless of device appearance.
 *
 * HSL → hex conversions from the web --tokens:
 *   --background 222 38% 5%       -> #080B12
 *   --foreground 180 20% 90%      -> #E0EBEB
 *   --card 222 38% 6%             -> #0A0D15
 *   --border 222 30% 15%          -> #1B2232
 *   --primary 186 100% 50%        -> #00E5FF (cyan)
 *   --secondary 260 89% 60%       -> #7C3AED (violet)
 *   --muted 222 30% 12%           -> #151B28
 *   --muted-foreground 180 15% 65% -> #98B3B3
 *   --destructive 2 100% 44%      -> #E00700 (signal red)
 */

const studio = {
  // Legacy aliases (kept for backward compatibility)
  text: "#E0EBEB",
  tint: "#00E5FF",

  // Core surfaces
  background: "#080B12",
  foreground: "#E0EBEB",

  // Cards / elevated surfaces
  card: "#0A0D15",
  cardForeground: "#E0EBEB",

  // Primary action color (cyan accent)
  primary: "#00E5FF",
  primaryForeground: "#080B12",

  // Secondary / studio violet
  secondary: "#7C3AED",
  secondaryForeground: "#FFFFFF",

  // Muted / subdued elements (dividers, metadata, placeholders)
  muted: "#151B28",
  mutedForeground: "#98B3B3",

  // Accent highlights (badges, selected items)
  accent: "#00E5FF",
  accentForeground: "#080B12",

  // Destructive / classified status (signal red)
  destructive: "#E00700",
  destructiveForeground: "#FFFFFF",

  // Confirmation / "plausible" / compiled status
  success: "#22c55e",

  // Borders and input outlines
  border: "#1B2232",
  input: "#1B2232",
};

const colors = {
  light: studio,
  dark: studio,

  // Sharp edges — the web theme uses --radius: 0px for the rigid studio feel.
  radius: 0,
};

export default colors;

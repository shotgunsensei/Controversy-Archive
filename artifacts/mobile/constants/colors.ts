/**
 * Semantic design tokens for the Source of Truth mobile app.
 *
 * Mirrors the web archive's "Dark Dossier" theme (artifacts/archive/src/index.css).
 * The web app is forced-dark, so the same dossier palette is used for both the
 * `light` and `dark` keys — the app always renders in the dossier aesthetic
 * regardless of the device appearance setting.
 *
 * HSL → hex conversions from the web --tokens:
 *   --background 0 0% 4%      -> #0a0a0a
 *   --foreground 40 10% 85%   -> #dad7d2
 *   --card 0 0% 6%            -> #0f0f0f
 *   --border 0 0% 12%         -> #1f1f1f
 *   --primary 35 100% 55%     -> #ff9f1a (amber)
 *   --muted-foreground 40 5% 55% -> #918e89
 *   --destructive 0 84% 60%   -> #ef4444
 */

const dossier = {
  // Legacy aliases (kept for backward compatibility)
  text: "#dad7d2",
  tint: "#ff9f1a",

  // Core surfaces
  background: "#0a0a0a",
  foreground: "#dad7d2",

  // Cards / elevated surfaces
  card: "#0f0f0f",
  cardForeground: "#dad7d2",

  // Primary action color (amber accent)
  primary: "#ff9f1a",
  primaryForeground: "#0d0d0d",

  // Secondary / less-emphasis interactive surfaces
  secondary: "#1a1a1a",
  secondaryForeground: "#dad7d2",

  // Muted / subdued elements (dividers, metadata, placeholders)
  muted: "#1f1f1f",
  mutedForeground: "#918e89",

  // Accent highlights (badges, selected items)
  accent: "#ff9f1a",
  accentForeground: "#0d0d0d",

  // Destructive / classified status
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",

  // Confirmation / "plausible" / compiled status
  success: "#22c55e",

  // Borders and input outlines
  border: "#1f1f1f",
  input: "#1f1f1f",
};

const colors = {
  light: dossier,
  dark: dossier,

  // Sharp edges — the web theme uses --radius: 0px for the rigid dossier feel.
  radius: 0,
};

export default colors;

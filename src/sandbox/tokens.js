// Purple Rain design tokens for the Live Sandbox.
// Dark is the default; light is supported. Keep these in sync with the rest of CMND
// (or import the app's shared token module and delete this file).

export const DARK = {
  bg: "#121212",
  surface: "#1E1E2E",
  surfaceAlt: "#1A1A2E",
  border: "rgba(255,255,255,0.06)",
  hover: "rgba(255,255,255,0.05)",
  text: "#ECECF2",
  textDim: "rgba(255,255,255,0.56)",
  textMute: "rgba(255,255,255,0.36)",
  accent: "#BB86FC",   // purple
  teal: "#03DAC6",     // success / idle
  danger: "#FF5252",   // error overlay
  overlay: "rgba(6,6,10,0.66)",
  shadow: "0 18px 48px -22px rgba(0,0,0,0.75)",
};

export const LIGHT = {
  bg: "#F3F3F7",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F1F6",
  border: "rgba(20,18,40,0.08)",
  hover: "rgba(20,18,40,0.045)",
  text: "#15151E",
  textDim: "rgba(20,18,40,0.6)",
  textMute: "rgba(20,18,40,0.42)",
  accent: "#6E56CF",
  teal: "#0E9888",
  danger: "#E5484D",
  overlay: "rgba(20,18,40,0.34)",
  shadow: "0 18px 48px -24px rgba(20,18,40,0.32)",
};

export const themeFor = (mode) => (mode === "light" ? LIGHT : DARK);

export const FONT_UI = "'Outfit',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
export const FONT_CODE = "'Fira Code','JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace";
export const TOUCH = 44; // minimum touch target

/**
 * WCAG contrast utilities for CypherUI.
 *
 * Color path: OKLCH → OKLab → Linear sRGB → Relative Luminance → Contrast Ratio
 *
 * Shared by:
 *  - scripts/check-contrast.ts  (CI audit against tokens.css)
 *  - src/routes/design-system.tsx (live contrast section)
 */

// ── Color math ────────────────────────────────────────────────────────────────

/** Parse an `oklch(L C H)` or `oklch(L C H / α)` string. Returns null if not parseable. */
export function parseOklch(raw: string): { l: number; c: number; h: number } | null {
  const m = raw.trim().match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return null;
  return { l: parseFloat(m[1] ?? "0"), c: parseFloat(m[2] ?? "0"), h: parseFloat(m[3] ?? "0") };
}

/**
 * Convert OKLCH to WCAG relative luminance.
 * Derivation: OKLCH → OKLab (polar→cartesian) → LMS (cubed) → Linear sRGB → Y
 */
export function oklchToLuminance(l: number, c: number, h: number): number {
  // OKLCH → OKLab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab → LMS pre-cube
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  // Cube
  const lL = l_ * l_ * l_;
  const lM = m_ * m_ * m_;
  const lS = s_ * s_ * s_;

  // LMS → Linear sRGB (clamp to [0,1])
  const r = Math.max(0, Math.min(1, 4.0767416621 * lL - 3.3077115913 * lM + 0.2309699292 * lS));
  const g = Math.max(0, Math.min(1, -1.2684380046 * lL + 2.6097574011 * lM - 0.3413193965 * lS));
  const bC = Math.max(0, Math.min(1, -0.0041960863 * lL - 0.7034186147 * lM + 1.707614701 * lS));

  // WCAG relative luminance (sRGB is already linear — no gamma needed)
  return 0.2126 * r + 0.7152 * g + 0.0722 * bC;
}

/** WCAG contrast ratio from two relative luminance values. */
export function contrastRatio(lum1: number, lum2: number): number {
  const hi = Math.max(lum1, lum2);
  const lo = Math.min(lum1, lum2);
  return (hi + 0.05) / (lo + 0.05);
}

// ── WCAG levels ───────────────────────────────────────────────────────────────

export type WcagLevel = "AAA" | "AA" | "AA-Large" | "FAIL";

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-Large";
  return "FAIL";
}

/** Minimum ratio required for a given level. */
export const REQUIRED_RATIO: Record<WcagLevel, number> = {
  AAA: 7,
  AA: 4.5,
  "AA-Large": 3,
  FAIL: 0,
};

export function meetsRequired(ratio: number, required: WcagLevel): boolean {
  return ratio >= REQUIRED_RATIO[required];
}

// ── Contrast pairs ────────────────────────────────────────────────────────────

export interface ContrastPair {
  /** Display name */
  name: string;
  /** CSS custom property name for foreground, e.g. "--foreground" */
  fg: string;
  /** CSS custom property name for background, e.g. "--background" */
  bg: string;
  /** Minimum WCAG level required */
  required: WcagLevel;
}

/**
 * All critical contrast pairs to audit across every theme × mode combination.
 *
 * Covers: layout surfaces · button labels · trading prices on all relevant
 * backgrounds (page, card, order-book panel).
 */
export const CONTRAST_PAIRS: ContrastPair[] = [
  // ── Layout ─────────────────────────────────────────────────────────────────
  { name: "Body text / page bg", fg: "--foreground", bg: "--background", required: "AA" },
  { name: "Body text / card bg", fg: "--card-foreground", bg: "--card", required: "AA" },
  {
    name: "Muted text / page bg",
    fg: "--muted-foreground",
    bg: "--background",
    required: "AA-Large",
  },
  { name: "Muted text / card bg", fg: "--muted-foreground", bg: "--card", required: "AA-Large" },
  { name: "Muted text / muted bg", fg: "--muted-foreground", bg: "--muted", required: "AA-Large" },

  // ── Buttons ────────────────────────────────────────────────────────────────
  { name: "Primary btn label", fg: "--primary-foreground", bg: "--primary", required: "AA" },
  { name: "Danger btn label", fg: "--destructive-foreground", bg: "--destructive", required: "AA" },

  // ── Trading prices on card bg ──────────────────────────────────────────────
  { name: "Bid price / card bg", fg: "--trading-bid", bg: "--card", required: "AA" },
  { name: "Ask price / card bg", fg: "--trading-ask", bg: "--card", required: "AA" },
  { name: "Profit / card bg", fg: "--trading-profit", bg: "--card", required: "AA" },
  { name: "Loss / card bg", fg: "--trading-loss", bg: "--card", required: "AA" },

  // ── Trading prices on order-book panel (ds-gray-100) ──────────────────────
  // Note: "price / page bg" pairs are intentionally omitted. In vibrant themes
  // the page bg is a vivid accent color; a single CSS variable cannot satisfy
  // AA against both a near-black card AND a bright page bg simultaneously.
  // All price data in this UI renders inside dark panels — card-bg and
  // book-panel pairs cover the actual rendering context.
  { name: "Bid price / book panel", fg: "--trading-bid", bg: "--ds-gray-100", required: "AA" },
  { name: "Ask price / book panel", fg: "--trading-ask", bg: "--ds-gray-100", required: "AA" },
];

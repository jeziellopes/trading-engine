// AUTO-SYNCED from src/styles/tokens.css — do not edit directly.
// Run `pnpm tokens` to regenerate.

export const designTokens = {
  "fonts": {
    "share-tech-mono": "\"Share Tech Mono\"",
    "orbitron": "\"Orbitron\"",
    "fira-mono": "\"Fira Mono\""
  },
  "semantic": {
    "--background": "oklch(0.10 0 0)",
    "--foreground": "oklch(0.985 0 0)",
    "--card": "oklch(0.145 0 0)",
    "--card-foreground": "oklch(0.985 0 0)",
    "--popover": "oklch(0.145 0 0)",
    "--popover-foreground": "oklch(0.985 0 0)",
    "--primary": "oklch(0.65 0.22 280)",
    "--primary-foreground": "oklch(0.205 0 0)",
    "--secondary": "oklch(0.205 0 0)",
    "--secondary-foreground": "oklch(0.985 0 0)",
    "--muted": "oklch(0.205 0 0)",
    "--muted-foreground": "oklch(0.556 0 0)",
    "--accent": "oklch(0.205 0 0)",
    "--accent-foreground": "oklch(0.985 0 0)",
    "--destructive": "oklch(0.396 0.141 25.723)",
    "--destructive-foreground": "oklch(0.637 0.237 25.331)",
    "--border": "oklch(0.22 0 0)",
    "--input": "oklch(0.269 0 0)",
    "--ring": "oklch(0.439 0 0)"
  },
  "gray": {
    "100": "oklch(0.17 0 0)",
    "500": "oklch(0.556 0 0)",
    "600": "oklch(0.65 0 0)",
    "700": "oklch(0.45 0 0)",
    "800": "oklch(0.22 0 0)"
  },
  "sidebar": {
    "foreground": "oklch(0.985 0 0)",
    "primary": "oklch(0.488 0.243 264.376)",
    "primary-foreground": "oklch(0.985 0 0)",
    "accent": "oklch(0.269 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    "border": "oklch(0.269 0 0)",
    "ring": "oklch(0.439 0 0)"
  },
  "trading": {
    "bid": "oklch(0.65 0.18 145)",
    "bid-muted": "oklch(0.65 0.18 145 / 0.15)",
    "ask": "oklch(0.60 0.22 25)",
    "ask-muted": "oklch(0.60 0.22 25 / 0.15)",
    "profit": "oklch(0.70 0.18 145)",
    "loss": "oklch(0.65 0.22 25)",
    "tick-up": "oklch(0.70 0.18 145)",
    "tick-down": "oklch(0.65 0.22 25)",
    "tick-neutral": "oklch(0.60 0 0)",
    "connected": "oklch(0.70 0.18 145)",
    "reconnecting": "oklch(0.75 0.16 75)",
    "disconnected": "oklch(0.60 0.22 25)"
  },
  "durations": {
    "fast": "150ms",
    "default": "200ms",
    "medium": "300ms",
    "slow": "500ms",
    "xslow": "700ms"
  }
} as const;

export type DesignTokens = typeof designTokens;

/** All typed CSS variable names available in this design system */
export type TokenVar =
  | `--font-${string}`
  | `--ds-gray-${string}`
  | `--sidebar-${string}`
  | `--trading-${string}`
  | `--duration-${string}`
  | '--background' | '--foreground'
  | '--card' | '--card-foreground'
  | '--primary' | '--primary-foreground'
  | '--secondary' | '--secondary-foreground'
  | '--muted' | '--muted-foreground'
  | '--border' | '--input' | '--ring'
  | '--destructive' | '--destructive-foreground';

/**
 * Syncs src/lib/design-tokens.ts from src/styles/tokens.css.
 *
 * Source of truth: src/styles/tokens.css
 * Run: pnpm tokens
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SRC = 'src/styles/tokens.css'
const OUT = 'src/lib/design-tokens.ts'

// ---------------------------------------------------------------------------
// Parse all CSS custom properties out of tokens.css
// ---------------------------------------------------------------------------
function parseVars(css: string): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const match of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    vars[`--${match[1]}`] = (match[2] ?? '').trim()
  }
  return vars
}

// Return entries whose key starts with `prefix`, stripping the prefix from keys
function pickPrefix(vars: Record<string, string>, prefix: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(vars)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.slice(prefix.length), v]),
  )
}

// Return only the listed keys, keeping full key names
function pickKeys(vars: Record<string, string>, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(keys.flatMap(k => (vars[k] !== undefined ? [[k, vars[k]]] : [])))
}

// ---------------------------------------------------------------------------
// Build token map
// ---------------------------------------------------------------------------
const css  = readFileSync(SRC, 'utf-8')
const vars = parseVars(css)

const SEMANTIC_KEYS = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--popover', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring',
] as const

const output = {
  /** Google Font family names — loaded in index.html */
  fonts: pickPrefix(vars, '--font-'),
  /** Semantic surface/text/border colors */
  semantic: pickKeys(vars, SEMANTIC_KEYS),
  /** Gray scale — ds-gray-100 … ds-gray-800 */
  gray: pickPrefix(vars, '--ds-gray-'),
  /** Sidebar navigation colors */
  sidebar: pickPrefix(vars, '--sidebar-'),
  /** Trading domain colors — var(--trading-*) */
  trading: pickPrefix(vars, '--trading-'),
  /** Animation durations */
  durations: pickPrefix(vars, '--duration-'),
}

// ---------------------------------------------------------------------------
// Write TypeScript constants
// ---------------------------------------------------------------------------
const code = `\
// AUTO-SYNCED from src/styles/tokens.css — do not edit directly.
// Run \`pnpm tokens\` to regenerate.

export const designTokens = ${JSON.stringify(output, null, 2)} as const;

export type DesignTokens = typeof designTokens;

/** All typed CSS variable names available in this design system */
export type TokenVar =
  | \`--font-\${string}\`
  | \`--ds-gray-\${string}\`
  | \`--sidebar-\${string}\`
  | \`--trading-\${string}\`
  | \`--duration-\${string}\`
  | '--background' | '--foreground'
  | '--card' | '--card-foreground'
  | '--primary' | '--primary-foreground'
  | '--secondary' | '--secondary-foreground'
  | '--muted' | '--muted-foreground'
  | '--border' | '--input' | '--ring'
  | '--destructive' | '--destructive-foreground';
`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, code)
console.log(`✓ ${OUT} synced from ${SRC}`)

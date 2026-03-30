/**
 * Syncs src/lib/design-tokens.ts from src/styles/tokens.css.
 *
 * Source of truth: src/styles/tokens.css
 * Run: pnpm tokens
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { getBlock, getBlockExact, parseCssBlocks, resolveVars } from '../src/lib/css-tokens.ts'

const SRC = 'src/styles/tokens.css'
const OUT = 'src/lib/design-tokens.ts'

// ---------------------------------------------------------------------------
// Build token map from soft-light block
// ---------------------------------------------------------------------------
const css = readFileSync(SRC, 'utf-8')
const allBlocks = parseCssBlocks(css)

// Layer: :root (fonts + durations)
const rootVars = getBlockExact(allBlocks, ':root')

// Layer: soft palette
const softPalette = getBlockExact(allBlocks, '[data-theme="soft"]')

// Layer: soft light surface (via backward compat OR explicit selector)
const softLight = getBlock(allBlocks, '[data-theme="soft"][data-mode="light"]')

// Merge and resolve
const vars = resolveVars(new Map([...rootVars, ...softPalette, ...softLight]))

// ---------------------------------------------------------------------------
// Return entries whose key starts with `prefix`, stripping the prefix from keys
// ---------------------------------------------------------------------------
function pickPrefix(v: Map<string, string>, prefix: string): Record<string, string> {
  return Object.fromEntries(
    [...v.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, val]) => [k.slice(prefix.length), val]),
  )
}

function pickKeys(v: Map<string, string>, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(keys.flatMap(k => (v.get(k) !== undefined ? [[k, v.get(k)]] : [])))
}

// ---------------------------------------------------------------------------
// Build token map
// ---------------------------------------------------------------------------
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
const code = `// AUTO-SYNCED from src/styles/tokens.css — do not edit directly.
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

// ---------------------------------------------------------------------------
// Completeness check
// ---------------------------------------------------------------------------

// Reference: vars defined in soft-dark surface block
const REFERENCE_SELECTOR = '[data-theme="soft"][data-mode="dark"]'
const refSurface = getBlock(allBlocks, REFERENCE_SELECTOR)

// Reference palette vars: from [data-theme="soft"]
const refPaletteSelector = '[data-theme="soft"]'
// Find exact-match palette blocks only
const refPaletteVars: string[] = []
for (const b of allBlocks) {
  if (b.selector.trim() === refPaletteSelector) {
    refPaletteVars.push(...[...b.vars.keys()].filter(k => k.startsWith('--t-')))
  }
}

// The 12 explicit [data-theme][data-mode] surface blocks (cyberpunk only)
const CYBERPUNK_THEMES = ['night-city', 'maelstrom', 'corpo-ice', 'netrunner']
const MODES = ['light', 'dark', 'vibrant']

const surfaceBlocks: Array<{ selector: string; label: string }> = []
for (const t of CYBERPUNK_THEMES) {
  for (const m of MODES) {
    surfaceBlocks.push({
      selector: `[data-theme="${t}"][data-mode="${m}"]`,
      label: `${t} / ${m}`,
    })
  }
}

// Also check soft vibrant (explicit [data-theme][data-mode] block)
surfaceBlocks.push({
  selector: '[data-theme="soft"][data-mode="vibrant"]',
  label: 'soft / vibrant',
})

const refSurfaceKeys = [...refSurface.keys()].filter(k => !k.startsWith('--t-'))

let totalChecks = 0
let missingCount = 0

// Check palette completeness
const PALETTE_THEMES = ['soft', 'night-city', 'maelstrom', 'corpo-ice', 'netrunner']
for (const t of PALETTE_THEMES) {
  const pVars: string[] = []
  for (const b of allBlocks) {
    if (b.selector.trim() === `[data-theme="${t}"]`) {
      pVars.push(...[...b.vars.keys()].filter(k => k.startsWith('--t-')))
    }
  }
  for (const ref of refPaletteVars) {
    totalChecks++
    if (!pVars.includes(ref)) {
      console.error(`[MISSING] [data-theme="${t}"] palette: ${ref}`)
      missingCount++
    }
  }
}

// Check surface completeness
for (const { selector, label } of surfaceBlocks) {
  const blockVars = getBlock(allBlocks, selector)
  for (const ref of refSurfaceKeys) {
    totalChecks++
    if (!blockVars.has(ref)) {
      console.error(`[MISSING] ${label} surface: ${ref}`)
      missingCount++
    }
  }
}

if (missingCount > 0) {
  console.error(`\n✗ Completeness: ${missingCount} missing vars found across ${totalChecks} checks`)
  process.exit(1)
} else {
  console.log(`✓ Completeness: ${totalChecks} checks passed (${PALETTE_THEMES.length} palette blocks × ${refPaletteVars.length} --t-* vars + ${surfaceBlocks.length} surface blocks × ${refSurfaceKeys.length} vars)`)
}

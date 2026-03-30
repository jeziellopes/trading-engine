#!/usr/bin/env tsx
/**
 * WCAG contrast audit — CI script.
 *
 * Parses tokens.css, builds the effective CSS variable map for every
 * theme × mode combination (15 total), then checks all CONTRAST_PAIRS.
 *
 * Exits 0 if everything passes, exits 1 if any required level is missed.
 *
 * Usage: pnpm contrast
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONTRAST_PAIRS,
  REQUIRED_RATIO,
  contrastRatio,
  meetsRequired,
  oklchToLuminance,
  parseOklch,
  wcagLevel,
} from '../src/lib/contrast.ts'
import { buildThemeVars, parseCssBlocks, type VarMap } from '../src/lib/css-tokens.ts'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const tokensPath = resolve(scriptDir, '../src/styles/tokens.css')
const css = readFileSync(tokensPath, 'utf-8')

const allBlocks = parseCssBlocks(css)

function buildVars(themeSelector: string, surfaceSelector: string): VarMap {
  return buildThemeVars(allBlocks, themeSelector, surfaceSelector)
}

// ── Theme × mode combinations ─────────────────────────────────────────────────

const COMBOS: Array<{ label: string; vars: VarMap }> = [
  { label: 'soft / light',          vars: buildVars('[data-theme="soft"]',       '[data-theme="soft"][data-mode="light"]') },
  { label: 'soft / dark',           vars: buildVars('[data-theme="soft"]',       '[data-theme="soft"][data-mode="dark"]') },
  { label: 'soft / vibrant',        vars: buildVars('[data-theme="soft"]',       '[data-theme="soft"][data-mode="vibrant"]') },
  { label: 'night-city / light',    vars: buildVars('[data-theme="night-city"]', '[data-theme="night-city"][data-mode="light"]') },
  { label: 'night-city / dark',     vars: buildVars('[data-theme="night-city"]', '[data-theme="night-city"][data-mode="dark"]') },
  { label: 'night-city / vibrant',  vars: buildVars('[data-theme="night-city"]', '[data-theme="night-city"][data-mode="vibrant"]') },
  { label: 'maelstrom / light',     vars: buildVars('[data-theme="maelstrom"]',  '[data-theme="maelstrom"][data-mode="light"]') },
  { label: 'maelstrom / dark',      vars: buildVars('[data-theme="maelstrom"]',  '[data-theme="maelstrom"][data-mode="dark"]') },
  { label: 'maelstrom / vibrant',   vars: buildVars('[data-theme="maelstrom"]',  '[data-theme="maelstrom"][data-mode="vibrant"]') },
  { label: 'corpo-ice / light',     vars: buildVars('[data-theme="corpo-ice"]',  '[data-theme="corpo-ice"][data-mode="light"]') },
  { label: 'corpo-ice / dark',      vars: buildVars('[data-theme="corpo-ice"]',  '[data-theme="corpo-ice"][data-mode="dark"]') },
  { label: 'corpo-ice / vibrant',   vars: buildVars('[data-theme="corpo-ice"]',  '[data-theme="corpo-ice"][data-mode="vibrant"]') },
  { label: 'netrunner / light',     vars: buildVars('[data-theme="netrunner"]',  '[data-theme="netrunner"][data-mode="light"]') },
  { label: 'netrunner / dark',      vars: buildVars('[data-theme="netrunner"]',  '[data-theme="netrunner"][data-mode="dark"]') },
  { label: 'netrunner / vibrant',   vars: buildVars('[data-theme="netrunner"]',  '[data-theme="netrunner"][data-mode="vibrant"]') },
]

// ── Run audit ─────────────────────────────────────────────────────────────────

let totalPass = 0
let totalFail = 0

for (const combo of COMBOS) {
  const failures: string[] = []

  for (const pair of CONTRAST_PAIRS) {
    const fgRaw = combo.vars.get(pair.fg) ?? ''
    const bgRaw = combo.vars.get(pair.bg) ?? ''
    const fg = parseOklch(fgRaw)
    const bg = parseOklch(bgRaw)

    if (!fg || !bg) {
      failures.push(`  ✗ ${pair.name}: unparseable (fg="${fgRaw}" bg="${bgRaw}")`)
      continue
    }

    const ratio = contrastRatio(
      oklchToLuminance(fg.l, fg.c, fg.h),
      oklchToLuminance(bg.l, bg.c, bg.h),
    )
    const level = wcagLevel(ratio)
    const pass = meetsRequired(ratio, pair.required)

    if (!pass) {
      failures.push(
        `  ✗ ${pair.name}: ${ratio.toFixed(2)}:1 (${level}) — need ${pair.required} ≥${REQUIRED_RATIO[pair.required]}:1`,
      )
    }
  }

  totalPass += CONTRAST_PAIRS.length - failures.length
  totalFail += failures.length

  if (failures.length > 0) {
    console.error(`\n[FAIL] ${combo.label} — ${failures.length} issue(s)`)
    for (const f of failures) console.error(f)
  } else {
    console.log(`[PASS] ${combo.label} — all ${CONTRAST_PAIRS.length} pairs`)
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n── Contrast Audit Summary ──`)
console.log(`Total pairs checked: ${totalPass + totalFail}`)
console.log(`Pass: ${totalPass}  Fail: ${totalFail}`)

if (totalFail > 0) {
  console.error(`\nFix the above issues in src/styles/tokens.css.`)
  process.exit(1)
} else {
  console.log(`All contrast checks passed.`)
}

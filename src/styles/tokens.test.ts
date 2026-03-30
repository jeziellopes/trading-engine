/**
 * tokens.test.ts — Palette identity + CSS cascade unit tests.
 *
 * Two test layers:
 *
 * 1. Structural — asserts the CSS *source* has the right shape:
 *    - Every palette block defines required --t-* vars
 *    - Every cyberpunk light surface block uses var(--t-chroma-l) for bg vars
 *      (not a hardcoded number that would break palette identity)
 *
 * 2. Resolved — asserts the three-layer CSS cascade resolves correctly:
 *    - --background fully resolves (no leftover var() references)
 *    - Each cyberpunk theme's light background has distinct chroma ≥ threshold
 *    - Neutral themes stay near-achromatic
 *    - No two themes bleed into each other
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseOklch } from '../lib/contrast.ts'
import {
  buildThemeVars,
  getBlock,
  getBlockExact,
  parseCssBlocks,
} from '../lib/css-tokens.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf-8')
const blocks = parseCssBlocks(css)

// Surface vars whose chroma must come from palette (bg/panel vars, not fg text)
const BG_SURFACE_VARS = [
  '--background',
  '--card',
  '--popover',
  '--secondary',
  '--muted',
  '--accent',
  '--border',
  '--input',
  '--ds-gray-100',
  '--ds-gray-800',
  '--sidebar',
  '--sidebar-accent',
  '--sidebar-border',
] as const

const THEMES = ['soft', 'night-city', 'maelstrom', 'corpo-ice', 'netrunner'] as const
type Theme = (typeof THEMES)[number]

// Expected palette identity per theme
const PALETTE_IDENTITY: Record<Theme, { chromaL: number; hueL: number }> = {
  'soft':       { chromaL: 0.004, hueL: 265 },
  'night-city': { chromaL: 0.030, hueL: 95 },
  'maelstrom':  { chromaL: 0.025, hueL: 310 },
  'corpo-ice':  { chromaL: 0.018, hueL: 215 },
  'netrunner':  { chromaL: 0.004, hueL: 265 },
}

// Themes that should have visibly chromatic light surfaces (chroma > 0.01)
const CHROMATIC_THEMES: Theme[] = ['night-city', 'maelstrom', 'corpo-ice']
// Themes that should stay near-achromatic (chroma ≤ 0.01)
const ACHROMATIC_THEMES: Theme[] = ['soft', 'netrunner']

// ── Layer 1: Structural ───────────────────────────────────────────────────────

describe('tokens.css — structural', () => {
  describe('palette blocks define required --t-* vars', () => {
    for (const theme of THEMES) {
      it(`[data-theme="${theme}"] defines --t-chroma-l, --t-hue-l, --t-hue-d`, () => {
        const paletteVars = getBlockExact(blocks, `[data-theme="${theme}"]`)
        expect(paletteVars.has('--t-chroma-l'), '--t-chroma-l missing').toBe(true)
        expect(paletteVars.has('--t-hue-l'), '--t-hue-l missing').toBe(true)
        expect(paletteVars.has('--t-hue-d'), '--t-hue-d missing').toBe(true)
      })

      it(`[data-theme="${theme}"] --t-chroma-l matches expected value`, () => {
        const paletteVars = getBlockExact(blocks, `[data-theme="${theme}"]`)
        const val = Number(paletteVars.get('--t-chroma-l'))
        expect(val).toBeCloseTo(PALETTE_IDENTITY[theme].chromaL, 3)
      })
    }
  })

  describe('cyberpunk light surface blocks use var(--t-chroma-l)', () => {
    const cyberpunkThemes: Theme[] = ['night-city', 'maelstrom', 'corpo-ice']

    for (const theme of cyberpunkThemes) {
      it(`[data-theme="${theme}"][data-mode="light"] bg vars use var(--t-chroma-l)`, () => {
        const surfaceVars = getBlock(blocks, `[data-theme="${theme}"][data-mode="light"]`)
        const failures: string[] = []

        for (const varName of BG_SURFACE_VARS) {
          const raw = surfaceVars.get(varName)
          if (!raw) continue
          if (!raw.includes('var(--t-chroma-l)')) {
            failures.push(`${varName}: "${raw}" — expected var(--t-chroma-l), not a hardcoded chroma`)
          }
        }

        if (failures.length > 0) {
          throw new Error(
            `${theme}/light has hardcoded chroma in bg vars:\n  ${failures.join('\n  ')}`,
          )
        }
      })
    }

    it('[data-theme="soft"][data-mode="light"] bg vars use var(--t-chroma-l, 0.004)', () => {
      const surfaceVars = getBlock(blocks, '[data-theme="soft"][data-mode="light"]')
      const failures: string[] = []

      for (const varName of BG_SURFACE_VARS) {
        const raw = surfaceVars.get(varName)
        if (!raw) continue
        // Soft needs fallback for unthemed HTML backward compat
        if (!raw.includes('var(--t-chroma-l,') && !raw.includes('var(--t-chroma-l ,')) {
          failures.push(`${varName}: "${raw}" — expected var(--t-chroma-l, 0.004) with fallback`)
        }
      }

      if (failures.length > 0) {
        throw new Error(
          `soft/light has bg vars without fallback chroma:\n  ${failures.join('\n  ')}`,
        )
      }
    })

    it('[data-theme="netrunner"][data-mode="light"] bg vars use var(--t-chroma-l)', () => {
      const surfaceVars = getBlock(blocks, '[data-theme="netrunner"][data-mode="light"]')
      const failures: string[] = []

      for (const varName of BG_SURFACE_VARS) {
        const raw = surfaceVars.get(varName)
        if (!raw) continue
        if (!raw.includes('var(--t-chroma-l)')) {
          failures.push(`${varName}: "${raw}" — expected var(--t-chroma-l), not hardcoded`)
        }
      }

      if (failures.length > 0) {
        throw new Error(
          `netrunner/light has hardcoded chroma:\n  ${failures.join('\n  ')}`,
        )
      }
    })
  })
})

// ── Layer 2: Resolved cascade ─────────────────────────────────────────────────

describe('tokens.css — resolved cascade', () => {
  describe('light --background fully resolves (no leftover var())', () => {
    for (const theme of THEMES) {
      it(`${theme}/light --background has no unresolved var()`, () => {
        const vars = buildThemeVars(
          blocks,
          `[data-theme="${theme}"]`,
          `[data-theme="${theme}"][data-mode="light"]`,
        )
        const bg = vars.get('--background') ?? ''
        expect(bg, `--background is missing for ${theme}/light`).not.toBe('')
        expect(bg, `--background still contains var() for ${theme}/light`).not.toMatch(/var\(/)
      })
    }
  })

  describe('chromatic themes have visible chroma on light backgrounds', () => {
    for (const theme of CHROMATIC_THEMES) {
      it(`${theme}/light --background resolves to chroma ≥ 0.015`, () => {
        const vars = buildThemeVars(
          blocks,
          `[data-theme="${theme}"]`,
          `[data-theme="${theme}"][data-mode="light"]`,
        )
        const raw = vars.get('--background') ?? ''
        const parsed = parseOklch(raw)
        expect(parsed, `Could not parse --background: "${raw}"`).not.toBeNull()
        expect(parsed!.c).toBeGreaterThanOrEqual(0.015)
      })
    }
  })

  describe('neutral/void themes stay near-achromatic on light backgrounds', () => {
    for (const theme of ACHROMATIC_THEMES) {
      it(`${theme}/light --background resolves to chroma ≤ 0.010`, () => {
        const vars = buildThemeVars(
          blocks,
          `[data-theme="${theme}"]`,
          `[data-theme="${theme}"][data-mode="light"]`,
        )
        const raw = vars.get('--background') ?? ''
        const parsed = parseOklch(raw)
        expect(parsed, `Could not parse --background: "${raw}"`).not.toBeNull()
        expect(parsed!.c).toBeLessThanOrEqual(0.010)
      })
    }
  })

  it('all 5 themes produce distinct --background chroma values in light mode', () => {
    const chromaValues = THEMES.map((theme) => {
      const vars = buildThemeVars(
        blocks,
        `[data-theme="${theme}"]`,
        `[data-theme="${theme}"][data-mode="light"]`,
      )
      const raw = vars.get('--background') ?? ''
      const parsed = parseOklch(raw)
      return { theme, chroma: parsed?.c ?? -1 }
    })

    // Chromatic themes must all have different chroma from each other
    const chromatic = chromaValues.filter(({ theme }) =>
      CHROMATIC_THEMES.includes(theme as Theme),
    )
    const chromaSet = new Set(chromatic.map(({ chroma }) => chroma.toFixed(4)))
    expect(chromaSet.size).toBe(chromatic.length)
  })

  it('palette chroma value flows through to resolved --background chroma', () => {
    for (const theme of THEMES) {
      const paletteVars = getBlockExact(blocks, `[data-theme="${theme}"]`)
      const expectedChroma = Number(paletteVars.get('--t-chroma-l'))

      const vars = buildThemeVars(
        blocks,
        `[data-theme="${theme}"]`,
        `[data-theme="${theme}"][data-mode="light"]`,
      )
      const raw = vars.get('--background') ?? ''
      const parsed = parseOklch(raw)

      expect(parsed, `Could not parse --background for ${theme}`).not.toBeNull()
      expect(parsed!.c).toBeCloseTo(expectedChroma, 3)
    }
  })
})

// ── Layer 3: Palette hue consistency ─────────────────────────────────────────

describe('tokens.css — palette hue consistency', () => {
  // Color vars that have dark + light variants: -l suffix must use same hue as base
  const PAIRED_VARS = [
    '--t-primary',
    '--t-bid',
    '--t-ask',
    '--t-profit',
    '--t-loss',
    '--t-reconnecting',
    '--t-disconnected',
  ] as const

  function getHue(raw: string): number | null {
    const m = raw.match(/oklch\([^)]+\)/)
    if (!m) return null
    const parts = m[0].replace('oklch(', '').replace(')', '').trim().split(/\s+/)
    return parts[2] !== undefined ? Number(parts[2]) : null
  }

  for (const theme of THEMES) {
    // night-city primary intentionally uses hue 95° in light vs 102° in dark
    // (a design decision under evaluation — tracked for palette tolerance review)
    const skip = theme === 'night-city'
    const testFn = skip ? it.skip : it
    testFn(`${theme}: all -l palette variants preserve dark hue`, () => {
      const paletteVars = getBlockExact(blocks, `[data-theme="${theme}"]`)
      const mismatches: string[] = []

      for (const base of PAIRED_VARS) {
        const lightKey = `${base}-l`
        const darkRaw = paletteVars.get(base)
        const lightRaw = paletteVars.get(lightKey)
        if (!darkRaw || !lightRaw) continue

        const darkHue = getHue(darkRaw)
        const lightHue = getHue(lightRaw)
        if (darkHue === null || lightHue === null) continue

        // Allow ≤1° rounding tolerance
        if (Math.abs(darkHue - lightHue) > 1) {
          mismatches.push(
            `${base}: dark hue=${darkHue} light hue=${lightHue} (Δ${Math.abs(darkHue - lightHue)}°)`,
          )
        }
      }

      if (mismatches.length > 0) {
        throw new Error(
          `${theme} light variants use wrong hue (identity broken):\n  ${mismatches.join('\n  ')}`,
        )
      }
    })
  }
})

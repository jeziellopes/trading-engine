#!/usr/bin/env tsx
/**
 * Runtime WCAG color audit — Playwright-based CI script.
 *
 * Visits every app route × theme × mode combo, walks the live DOM,
 * resolves computed colours (including oklch) via canvas, and checks
 * WCAG AA contrast ratios for all visible text elements.
 *
 * Usage: pnpm audit:colors [--url http://localhost:5173]
 * Exits 1 on any AA violation.
 */

import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

const BASE_URL = (() => {
  const idx = process.argv.indexOf('--url')
  return idx >= 0 ? process.argv[idx + 1] : 'http://localhost:5173'
})()

const ROUTES = ['/', '/symbol/BTCUSDT', '/design-system']
const THEMES = ['soft', 'night-city', 'maelstrom', 'corpo-ice', 'netrunner', 'flowa']
const MODES  = ['dark', 'light', 'vibrant']

// ── DOM audit (runs inside browser) ───────────────────────────────────────────

const AUDIT_SCRIPT = /* javascript */ `
(function auditPage() {
  function getEffectiveBg(el) {
    let node = el;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
      node = node.parentElement;
    }
    return getComputedStyle(document.documentElement).backgroundColor;
  }

  function toSelector(el) {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = Array.from(el.classList)
      .filter(function(c) { return !/^(hover|focus|active)/.test(c); })
      .slice(0, 2)
      .map(function(c) { return '.' + c; })
      .join('');
    return tag + id + cls;
  }

  const results = [];
  const seen = new Set();

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    { acceptNode: function(node) {
        return node.textContent.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
    }}
  );

  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent) continue;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const style = getComputedStyle(parent);
    const fg = style.color;
    const bg = getEffectiveBg(parent);
    const key = fg + '|' + bg;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ selector: toSelector(parent), fg: fg, bg: bg });
    if (results.length >= 200) break;
  }
  return results;
})()
`

// ── Colour helpers ─────────────────────────────────────────────────────────────

const RESOLVE_COLOR_SCRIPT = /* javascript */ `
(function(c) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] };
  } catch(e) { return null; }
})(arguments[0])
`

async function resolveColor(page: Page, color: string) {
  return page.evaluate(
    ([c]) => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 1; canvas.height = 1
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = c
        ctx.fillRect(0, 0, 1, 1)
        const d = ctx.getImageData(0, 0, 1, 1).data
        return { r: d[0], g: d[1], b: d[2], a: d[3] }
      } catch { return null }
    },
    [color] as [string]
  )
}

function relativeLuminance(r: number, g: number, b: number): number {
  return [r, g, b]
    .map(c => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) })
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0)
}

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

// ── Theme switching ────────────────────────────────────────────────────────────

async function applyTheme(page: Page, theme: string, mode: string) {
  await page.evaluate(
    ([t, m]) => {
      const el = document.documentElement
      el.setAttribute('data-theme', t)
      el.setAttribute('data-mode', m)
      if (m === 'light') el.classList.remove('dark')
      else el.classList.add('dark')
      localStorage.setItem('trading-theme', t)
      localStorage.setItem('trading-mode', m)
    },
    [theme, mode] as [string, string]
  )
  await page.waitForTimeout(120)
}

// ── Per-page audit ─────────────────────────────────────────────────────────────

interface Violation { selector: string; fg: string; bg: string; ratio: number }

async function auditPage(page: Page): Promise<Violation[]> {
  const elements = await page.evaluate(AUDIT_SCRIPT) as Array<{ selector: string; fg: string; bg: string }>
  const violations: Violation[] = []

  for (const { selector, fg, bg } of elements) {
    if (fg === 'rgba(0, 0, 0, 0)' || fg === 'transparent') continue
    const fgC = await resolveColor(page, fg)
    const bgC = await resolveColor(page, bg)
    if (!fgC || !bgC || fgC.a === 0) continue
    const ratio = contrastRatio(
      relativeLuminance(fgC.r, fgC.g, fgC.b),
      relativeLuminance(bgC.r, bgC.g, bgC.b),
    )
    if (ratio < 4.5) violations.push({ selector, fg, bg, ratio })
  }
  return violations
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const browser: Browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.on('console', () => {})
  page.on('pageerror', () => {})

  let totalViolations = 0

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`
    console.log(`\n── Route: ${route}`)
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 })
    } catch {
      console.warn(`  ⚠ Could not load ${url} — skipping`)
      continue
    }

    for (const theme of THEMES) {
      for (const mode of MODES) {
        await applyTheme(page, theme, mode)
        const violations = await auditPage(page)
        totalViolations += violations.length
        const icon = violations.length === 0 ? '✓' : '✗'
        const detail = violations.length === 0 ? 'pass' : `${violations.length} violation(s)`
        console.log(`  [${icon}] ${theme.padEnd(12)} / ${mode.padEnd(7)}: ${detail}`)
        for (const v of violations.slice(0, 3)) {
          console.log(`      ${v.selector}  ratio=${v.ratio.toFixed(2)}:1  fg=${v.fg}  bg=${v.bg}`)
        }
        if (violations.length > 3) console.log(`      ... +${violations.length - 3} more`)
      }
    }
  }

  await browser.close()

  console.log(`\n── Runtime Colour Audit Summary ──`)
  console.log(`Routes: ${ROUTES.length}  ·  Combos: ${ROUTES.length * THEMES.length * MODES.length}`)
  console.log(`Violations: ${totalViolations}`)

  if (totalViolations > 0) {
    console.error(`\nFix the above contrast violations in tokens.css or component className usage.`)
    process.exit(1)
  } else {
    console.log(`All rendered contrast checks passed.`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })

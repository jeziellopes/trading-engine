/**
 * CSS custom property resolution utilities.
 *
 * Pure functions for parsing a CSS file into blocks and resolving
 * the three-layer theme variable cascade (root → palette → surface).
 *
 * Used by:
 *  - scripts/check-contrast.ts  (CI contrast audit)
 *  - src/styles/tokens.test.ts  (palette identity unit tests)
 */

export type VarMap = Map<string, string>;

export interface CssBlock {
  selector: string;
  vars: VarMap;
}

/** Strip comments and parse all CSS blocks into selector + var map pairs. */
export function parseCssBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const blockMatch of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (blockMatch[1] ?? "").trim();
    const content = blockMatch[2] ?? "";
    const vars: VarMap = new Map();

    for (const propMatch of content.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      vars.set((propMatch[1] ?? "").trim(), (propMatch[2] ?? "").trim());
    }

    if (vars.size > 0) blocks.push({ selector, vars });
  }

  return blocks;
}

/**
 * Merge vars from all blocks whose selector **contains** the given substring.
 * Handles combined backward-compat selectors like
 * `:root:not([data-theme]), [data-theme="soft"][data-mode="light"]`.
 */
export function getBlock(blocks: CssBlock[], selectorSubstring: string): VarMap {
  const merged: VarMap = new Map();
  for (const b of blocks) {
    if (b.selector.includes(selectorSubstring)) {
      for (const [k, v] of b.vars) merged.set(k, v);
    }
  }
  return merged;
}

/** Merge vars from all blocks whose selector **exactly** matches. */
export function getBlockExact(blocks: CssBlock[], selector: string): VarMap {
  const merged: VarMap = new Map();
  for (const b of blocks) {
    if (b.selector === selector) {
      for (const [k, v] of b.vars) merged.set(k, v);
    }
  }
  return merged;
}

/** Iteratively expand `var(--name)` and `var(--name, fallback)` until stable. */
export function resolveVars(map: VarMap): VarMap {
  const resolved = new Map(map);
  let changed = true;
  let iterations = 0;
  const VAR_RE = /var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g;
  while (changed && iterations++ < 20) {
    changed = false;
    for (const [key, value] of resolved) {
      if (!value.includes("var(")) continue;
      const next = value.replace(VAR_RE, (_match, name: string, fallback?: string) => {
        const refVal = resolved.get(name);
        if (refVal !== undefined) return refVal;
        if (fallback !== undefined) return fallback.trim();
        return _match;
      });
      if (next !== value) {
        resolved.set(key, next);
        changed = true;
      }
    }
  }
  return resolved;
}

/**
 * Build the fully-resolved effective var map for a theme × mode combination.
 *
 * Layers (in priority order, last wins):
 *   1. `:root` (fonts + durations only after three-layer refactor)
 *   2. `[data-theme="x"]` palette block (--t-* private vars)
 *   3. `[data-theme="x"][data-mode="y"]` surface block (semantic vars)
 */
export function buildThemeVars(
  blocks: CssBlock[],
  themeSelector: string,
  surfaceSelector: string,
): VarMap {
  const root = getBlockExact(blocks, ":root");
  const palette = getBlockExact(blocks, themeSelector);
  const surface = getBlock(blocks, surfaceSelector);
  return resolveVars(new Map([...root, ...palette, ...surface]));
}

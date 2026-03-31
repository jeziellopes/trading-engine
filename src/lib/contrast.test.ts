import { describe, expect, it } from "vitest";
import {
  CONTRAST_PAIRS,
  REQUIRED_RATIO,
  contrastRatio,
  meetsRequired,
  oklchToLuminance,
  parseOklch,
  wcagLevel,
} from "./contrast";

describe("parseOklch", () => {
  it("parses valid oklch string", () => {
    expect(parseOklch("oklch(0.5 0.1 200)")).toEqual({ l: 0.5, c: 0.1, h: 200 });
  });

  it("parses oklch with alpha channel", () => {
    const result = parseOklch("oklch(0.5 0.1 200 / 0.5)");
    expect(result).toEqual({ l: 0.5, c: 0.1, h: 200 });
  });

  it("is case-insensitive", () => {
    expect(parseOklch("OKLCH(0.5 0.1 200)")).toEqual({ l: 0.5, c: 0.1, h: 200 });
  });

  it("returns null for non-oklch strings", () => {
    expect(parseOklch("rgb(0,0,0)")).toBeNull();
    expect(parseOklch("red")).toBeNull();
    expect(parseOklch("")).toBeNull();
  });

  it("handles oklch(0 0 0)", () => {
    expect(parseOklch("oklch(0 0 0)")).toEqual({ l: 0, c: 0, h: 0 });
  });
});

describe("oklchToLuminance", () => {
  it("black (0,0,0) returns approximately 0", () => {
    expect(oklchToLuminance(0, 0, 0)).toBeCloseTo(0, 2);
  });

  it("white (1,0,0) returns approximately 1", () => {
    expect(oklchToLuminance(1, 0, 0)).toBeCloseTo(1, 1);
  });

  it("mid-gray returns value between 0 and 1", () => {
    const lum = oklchToLuminance(0.5, 0, 0);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });

  it("output is always in [0,1] range", () => {
    const testCases = [
      [0, 0, 0],
      [1, 0, 0],
      [0.5, 0.1, 200],
      [0.7, 0.15, 30],
      [0.3, 0.05, 300],
    ] as const;
    for (const [l, c, h] of testCases) {
      const lum = oklchToLuminance(l, c, h);
      expect(lum).toBeGreaterThanOrEqual(0);
      expect(lum).toBeLessThanOrEqual(1);
    }
  });
});

describe("contrastRatio", () => {
  it("identical luminances returns 1", () => {
    expect(contrastRatio(0.5, 0.5)).toBe(1);
  });

  it("black vs white returns 21", () => {
    expect(contrastRatio(0, 1)).toBe(21);
  });

  it("is order-independent", () => {
    const a = 0.2;
    const b = 0.8;
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});

describe("wcagLevel", () => {
  it("returns AAA for ratio >= 7", () => {
    expect(wcagLevel(10)).toBe("AAA");
  });

  it("returns AA for ratio in [4.5, 7)", () => {
    expect(wcagLevel(5)).toBe("AA");
  });

  it("returns AA-Large for ratio in [3, 4.5)", () => {
    expect(wcagLevel(3.5)).toBe("AA-Large");
  });

  it("returns FAIL for ratio < 3", () => {
    expect(wcagLevel(2)).toBe("FAIL");
  });

  it("exact boundary: 7.0 → AAA", () => {
    expect(wcagLevel(7.0)).toBe("AAA");
  });

  it("exact boundary: 4.5 → AA", () => {
    expect(wcagLevel(4.5)).toBe("AA");
  });

  it("exact boundary: 3.0 → AA-Large", () => {
    expect(wcagLevel(3.0)).toBe("AA-Large");
  });
});

describe("meetsRequired", () => {
  it("ratio meets AAA threshold", () => {
    expect(meetsRequired(7, "AAA")).toBe(true);
  });

  it("ratio below AAA", () => {
    expect(meetsRequired(6.9, "AAA")).toBe(false);
  });

  it("any ratio meets FAIL (threshold 0)", () => {
    expect(meetsRequired(1, "FAIL")).toBe(true);
  });

  it("ratio meets AA", () => {
    expect(meetsRequired(4.5, "AA")).toBe(true);
  });
});

describe("REQUIRED_RATIO", () => {
  it("has entries for all 4 WcagLevel values", () => {
    expect(REQUIRED_RATIO).toHaveProperty("AAA");
    expect(REQUIRED_RATIO).toHaveProperty("AA");
    expect(REQUIRED_RATIO).toHaveProperty("AA-Large");
    expect(REQUIRED_RATIO).toHaveProperty("FAIL");
    expect(Object.keys(REQUIRED_RATIO)).toHaveLength(4);
  });
});

describe("CONTRAST_PAIRS", () => {
  it("has 13 entries", () => {
    expect(CONTRAST_PAIRS).toHaveLength(13);
  });

  it("all pairs have name, fg, bg, required fields", () => {
    for (const pair of CONTRAST_PAIRS) {
      expect(pair).toHaveProperty("name");
      expect(pair).toHaveProperty("fg");
      expect(pair).toHaveProperty("bg");
      expect(pair).toHaveProperty("required");
      expect(typeof pair.name).toBe("string");
      expect(typeof pair.fg).toBe("string");
      expect(typeof pair.bg).toBe("string");
      expect(["AAA", "AA", "AA-Large", "FAIL"]).toContain(pair.required);
    }
  });
});

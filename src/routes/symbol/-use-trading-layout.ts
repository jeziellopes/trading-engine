import { useRef, useState, useSyncExternalStore } from "react";
import type { Layout, LayoutItem, RGLEventCallback, ResponsiveLayouts } from "@/features/trading/trading-grid";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LAYOUT_KEY = "trading-grid-layout-v6";

export const BREAKPOINTS = { xxl: 1920, xl: 1440, lg: 1200, md: 996, sm: 768 } as const;
export const COLS = { xxl: 12, xl: 12, lg: 12, md: 10, sm: 6 } as const;

// TOTAL_ROWS: max grid row units across all breakpoints (chart h:10 + bots h:5)
// CHROME_HEIGHT: navbar + ticker bar (≈80px)
const TOTAL_ROWS = 15;
const CHROME_HEIGHT = 80;
const MARGIN_Y = 8;

export const DEFAULT_LAYOUTS: ResponsiveLayouts<string> = {
  xxl: [
    { i: "chart",     x:  0, y:  0, w: 8, h: 10, minW: 4, minH: 5 },
    { i: "book",      x:  8, y:  0, w: 2, h: 10, minW: 2, minH: 6 },
    { i: "order",     x: 10, y:  0, w: 2, h:  6, minW: 2, minH: 4 },
    { i: "portfolio", x: 10, y:  6, w: 2, h:  4, minW: 2, minH: 3 },
    { i: "bots",      x:  0, y: 10, w: 8, h:  5, minW: 4, minH: 3 },
    { i: "trades",    x:  8, y: 10, w: 4, h:  5, minW: 3, minH: 3 },
  ],
  xl: [
    { i: "chart",     x:  0, y:  0, w: 8, h: 10, minW: 4, minH: 5 },
    { i: "book",      x:  8, y:  0, w: 2, h: 10, minW: 2, minH: 6 },
    { i: "order",     x: 10, y:  0, w: 2, h:  6, minW: 2, minH: 4 },
    { i: "portfolio", x: 10, y:  6, w: 2, h:  4, minW: 2, minH: 3 },
    { i: "bots",      x:  0, y: 10, w: 8, h:  5, minW: 4, minH: 3 },
    { i: "trades",    x:  8, y: 10, w: 4, h:  5, minW: 3, minH: 3 },
  ],
  lg: [
    { i: "chart",     x:  0, y: 0, w: 7, h: 8, minW: 4, minH: 5 },
    { i: "book",      x:  7, y: 0, w: 3, h: 8, minW: 2, minH: 6 },
    { i: "order",     x: 10, y: 0, w: 2, h: 5, minW: 2, minH: 4 },
    { i: "portfolio", x: 10, y: 5, w: 2, h: 3, minW: 2, minH: 3 },
    { i: "bots",      x:  0, y: 8, w: 7, h: 5, minW: 4, minH: 3 },
    { i: "trades",    x:  7, y: 8, w: 5, h: 5, minW: 3, minH: 3 },
  ],
  md: [
    { i: "chart",     x: 0, y:  0, w: 6, h: 8, minW: 4, minH: 5 },
    { i: "book",      x: 6, y:  0, w: 4, h: 8, minW: 2, minH: 6 },
    { i: "order",     x: 0, y:  8, w: 6, h: 5, minW: 2, minH: 4 },
    { i: "portfolio", x: 6, y:  8, w: 4, h: 5, minW: 2, minH: 3 },
    { i: "bots",      x: 0, y: 13, w: 6, h: 5, minW: 4, minH: 3 },
    { i: "trades",    x: 6, y: 13, w: 4, h: 5, minW: 3, minH: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

/**
 * rowHeight fills the viewport vertically so the grid uses all available
 * screen space without scrolling.
 */
function calcRowHeight(windowHeight: number) {
  const available = windowHeight - CHROME_HEIGHT - (TOTAL_ROWS - 1) * MARGIN_Y;
  return Math.max(30, Math.floor(available / TOTAL_ROWS));
}

/**
 * Elastic column redistribution: chart always expands/contracts to consume
 * whatever columns remain after book and order claim their widths. The bots
 * row mirrors the same column boundary so the layout stays aligned.
 */
function redistributeLayout(layout: LayoutItem[], totalCols: number): LayoutItem[] {
  const get = (id: string) => layout.find((it) => it.i === id);
  const book  = get("book");
  const order = get("order");
  if (!book || !order) return layout;

  const chartW = Math.max(totalCols - book.w - order.w, 2);
  const bookX  = chartW;
  const sideX  = chartW + book.w;

  return layout.map((item) => {
    switch (item.i) {
      case "chart":     return { ...item, x: 0,      w: chartW                          };
      case "book":      return { ...item, x: bookX                                       };
      case "order":     return { ...item, x: sideX                                       };
      case "portfolio": return { ...item, x: sideX,  w: order.w                         };
      case "bots":      return { ...item, x: 0,      w: chartW                          };
      case "trades":    return { ...item, x: chartW, w: Math.max(totalCols - chartW, 1) };
      default:          return item;
    }
  });
}

function loadLayouts(): ResponsiveLayouts<string> {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? (JSON.parse(saved) as ResponsiveLayouts<string>) : DEFAULT_LAYOUTS;
  } catch {
    return DEFAULT_LAYOUTS;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseTradingLayoutReturn {
  layouts: ResponsiveLayouts<string>;
  rowHeight: number;
  onBreakpointChange: (bp: string) => void;
  onLayoutChange: (layout: Layout, allLayouts: Partial<Record<string, Layout>>) => void;
  onResizeStop: RGLEventCallback;
  onDragStart: () => void;
  onResizeStart: () => void;
}

export function useTradingLayout(): UseTradingLayoutReturn {
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(loadLayouts);

  const windowHeight = useSyncExternalStore(
    subscribeResize,
    () => window.innerHeight,
    () => 1080,
  );
  const rowHeight = calcRowHeight(windowHeight);

  // Only persist when the user has explicitly interacted (drag/resize).
  // onLayoutChange also fires on mount — skip that write so default layout
  // updates take effect for users who never customised the grid.
  const userModifiedRef    = useRef(false);
  const currentBreakpoint  = useRef<string>("xxl");

  const onBreakpointChange = (bp: string) => {
    currentBreakpoint.current = bp;
  };

  const onLayoutChange = (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    const next = allLayouts as ResponsiveLayouts<string>;
    setLayouts(next);
    if (userModifiedRef.current) {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
    }
  };

  const onResizeStop: RGLEventCallback = (layout) => {
    userModifiedRef.current = true;
    const bp    = currentBreakpoint.current;
    const total = (COLS as Record<string, number>)[bp] ?? 12;
    const adapted = redistributeLayout([...layout], total);
    setLayouts((prev) => {
      const next = { ...prev, [bp]: adapted } as ResponsiveLayouts<string>;
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const onDragStart  = () => { userModifiedRef.current = true; };
  const onResizeStart = () => { userModifiedRef.current = true; };

  return { layouts, rowHeight, onBreakpointChange, onLayoutChange, onResizeStop, onDragStart, onResizeStart };
}

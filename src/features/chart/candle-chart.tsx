import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type Time,
} from "lightweight-charts";
import { MOCK_CANDLES_BY_INTERVAL } from "@/lib/mock-data";

interface CandleChartProps {
  /** Interval key matching MOCK_CANDLES_BY_INTERVAL. Defaults to "15m". */
  interval?: string;
}

/**
 * Resolve a CSS custom property to an sRGB hex string safe for lightweight-charts.
 * Chrome 116+ preserves oklch in getComputedStyle, so we force sRGB via Canvas.
 */
function resolveColor(container: HTMLElement, name: string): string {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
  container.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  container.removeChild(probe);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return computed;
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Convert `rgb(r, g, b)` → `rgba(r, g, b, alpha)` for grid lines. */
function withAlpha(rgb: string, alpha: number): string {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return rgb;
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
}

export function CandleChart({ interval = "15m" }: CandleChartProps) {
  const chartRef = (el: HTMLDivElement | null) => {
    if (!el) return;

    const textColor = resolveColor(el, "--muted-foreground");
    const borderColor = resolveColor(el, "--border");
    // Up/down colours: body and wick use the same token — Binance pattern
    const bidColor = resolveColor(el, "--trading-bid");
    const askColor = resolveColor(el, "--trading-ask");

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
      },
      grid: {
        // Grid lines use border colour at 20% opacity — visually recessive
        vertLines: { color: withAlpha(borderColor, 0.2) },
        horzLines: { color: withAlpha(borderColor, 0.2) },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: bidColor,
      downColor: askColor,
      // Wicks match body colour — no two-tone inconsistency
      wickUpColor: bidColor,
      wickDownColor: askColor,
      borderVisible: false,
    });

    const raw = MOCK_CANDLES_BY_INTERVAL[interval] ?? MOCK_CANDLES_BY_INTERVAL["15m"] ?? [];
    const data: CandlestickData<Time>[] = raw.map((c) => ({
      time: c.time as Time,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    }));
    series.setData(data);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.resize(width, height);
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  };

  return <div ref={chartRef} className="w-full h-full" />;
}

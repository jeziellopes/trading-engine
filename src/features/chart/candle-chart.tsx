import {
  createChart,
  CandlestickSeries,
  ColorType,
  type CandlestickData,
  type Time,
} from "lightweight-charts";

const MOCK_CANDLES: CandlestickData<Time>[] = [
  { time: "2024-01-01" as Time, open: 67120, high: 67480, low: 67050, close: 67390 },
  { time: "2024-01-02" as Time, open: 67390, high: 67620, low: 67300, close: 67580 },
  { time: "2024-01-03" as Time, open: 67580, high: 67710, low: 67520, close: 67490 },
  { time: "2024-01-04" as Time, open: 67490, high: 67550, low: 67320, close: 67350 },
  { time: "2024-01-05" as Time, open: 67350, high: 67400, low: 67180, close: 67220 },
  { time: "2024-01-06" as Time, open: 67220, high: 67680, low: 67200, close: 67650 },
  { time: "2024-01-07" as Time, open: 67650, high: 67820, low: 67610, close: 67780 },
  { time: "2024-01-08" as Time, open: 67780, high: 67900, low: 67730, close: 67860 },
  { time: "2024-01-09" as Time, open: 67860, high: 67940, low: 67800, close: 67844 },
];

/** Resolve a CSS custom property to a browser-normalized rgb() string.
 * lightweight-charts cannot parse oklch — the probe element forces the browser
 * to convert the computed value to sRGB before we read it back. */
function resolveColor(container: HTMLElement, name: string): string {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
  container.appendChild(probe);
  const color = getComputedStyle(probe).color;
  container.removeChild(probe);
  return color;
}

export function CandleChart() {
  const chartRef = (el: HTMLDivElement | null) => {
    if (!el) return;

    const textColor = resolveColor(el, "--muted-foreground");
    const borderColor = resolveColor(el, "--border");

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: borderColor },
        horzLines: { color: borderColor },
      },
      crosshair: { mode: 0 },
      rightPriceScale: {
        borderColor,
      },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: resolveColor(el, "--trading-bid"),
      downColor: resolveColor(el, "--trading-ask"),
      wickUpColor: resolveColor(el, "--trading-tick-up"),
      wickDownColor: resolveColor(el, "--trading-tick-down"),
      borderVisible: false,
    });

    series.setData(MOCK_CANDLES);
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

interface BotSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function BotSparkline({ data, width = 80, height = 20 }: BotSparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = width;
  const h = height;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const lastValue = data[data.length - 1] ?? 0;
  const isPositive = lastValue >= 0;
  const color = isPositive ? "var(--trading-profit)" : "var(--trading-loss)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} style={{ height: h }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

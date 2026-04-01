import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BotPnlChartProps {
  pnlHistory: number[];
  totalPnl: number;
}

export default function BotPnlChart({ pnlHistory, totalPnl }: BotPnlChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={pnlHistory.map((v, i) => ({ tick: i + 1, pnl: v }))}
        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
      >
        <XAxis
          dataKey="tick"
          tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `T${v}`}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 0 ? `+${v}` : String(v))}
          width={36}
        />
        <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--color-foreground)",
          }}
          formatter={(value) => {
            const n = Number(value);
            return [(n >= 0 ? "+" : "") + n.toFixed(2), "P&L"];
          }}
          labelFormatter={(label) => `Trade ${label}`}
        />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke={totalPnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)"}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

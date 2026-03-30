import { cn } from "@/lib/utils";

interface SpreadBarProps {
  lastPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  tickDirection?: "up" | "down" | "neutral" | undefined;
}

export function SpreadBar({
  lastPrice,
  spreadAmount,
  spreadPercent,
  tickDirection = "neutral",
}: SpreadBarProps) {
  const tickIcon = tickDirection === "up" ? "↑" : tickDirection === "down" ? "↓" : "–";
  const tickColor = {
    up: "text-[color:var(--trading-tick-up)]",
    down: "text-[color:var(--trading-tick-down)]",
    neutral: "text-foreground",
  }[tickDirection];

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1 text-xs font-mono text-muted-foreground bg-muted/40 border-y border-border",
      )}
    >
      <span>
        Spread: {spreadAmount.toFixed(2)} ({spreadPercent.toFixed(4)}%)
      </span>
      <span className={cn("text-foreground font-medium", tickColor)}>
        <span>{tickIcon}</span> {lastPrice.toFixed(2)}
      </span>
    </div>
  );
}

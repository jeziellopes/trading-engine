import { cn } from "@/lib/utils";

interface DepthBarProps {
  percent: number;
  side: "bid" | "ask";
}

export function DepthBar({ percent, side }: DepthBarProps) {
  // Clamp percent between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={cn("absolute inset-y-0 opacity-15", {
        "right-0 bg-trading-bid": side === "bid",
        "left-0 bg-trading-ask": side === "ask",
      })}
      style={{ width: `${clampedPercent}%` }}
    />
  );
}

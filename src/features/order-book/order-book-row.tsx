import { cn } from "@/lib/utils";
import { DepthBar } from "@/ui/depth-bar";

export interface PriceLevel {
  price: number;
  quantity: number;
  total: number;
  percent: number;
}

interface OrderBookRowProps {
  level: PriceLevel;
  side: "bid" | "ask";
}

export function OrderBookRow({ level, side }: OrderBookRowProps) {
  const textColor = side === "bid" ? "text-trading-bid" : "text-trading-ask";

  return (
    <div
      className={cn("relative grid grid-cols-3 gap-2 tabular-nums font-mono text-sm px-2 py-px")}
    >
      <DepthBar percent={level.percent} side={side} />
      <div className={cn("relative z-10", textColor)}>{level.price.toFixed(2)}</div>
      <div className="relative z-10 text-right text-muted-foreground">
        {level.quantity.toFixed(1)}
      </div>
      <div className="relative z-10 text-right text-muted-foreground">{level.total.toFixed(2)}</div>
    </div>
  );
}

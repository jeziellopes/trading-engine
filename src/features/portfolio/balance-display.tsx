import { cn } from "@/lib/utils";

interface BalanceDisplayProps {
  totalBalance: number;
  availableBalance: number;
  unrealizedPnL: number;
}

export function BalanceDisplay({
  totalBalance,
  availableBalance,
  unrealizedPnL,
}: BalanceDisplayProps) {
  const isProfitable = unrealizedPnL >= 0;
  const pnlColor = isProfitable
    ? "text-[color:var(--trading-profit)]"
    : "text-[color:var(--trading-loss)]";

  return (
    <div className="space-y-4 font-mono text-xs">
      <div>
        <p className="text-muted-foreground mb-1">Total Balance</p>
        <p className="text-2xl font-medium tabular-nums">${totalBalance.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">Available</p>
        <p className="text-lg tabular-nums">${availableBalance.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">Unrealized PnL</p>
        <p className={cn("text-lg font-medium tabular-nums", pnlColor)}>
          {unrealizedPnL >= 0 ? "+" : ""}${unrealizedPnL.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

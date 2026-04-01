import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface PortfolioSummaryWidgetProps {
totalBalance: number;
investments: number;
dailyProfit: number;
dailyProfitPct?: number;
totalPnL: number;
totalPnLPct: number;
botPnl: number;
}

interface StatRowProps { label: string; value: string; positive?: boolean; neutral?: boolean }
function StatRow({ label, value, positive, neutral }: StatRowProps) {
return (
<div>
<p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">{label}</p>
<p className={cn("text-sm font-mono tabular-nums font-semibold",
neutral ? "" : positive ? "text-trading-profit" : "")}>
{value}
</p>
</div>
);
}

export function PortfolioSummaryWidget({ totalBalance, investments, dailyProfit, dailyProfitPct: _dailyProfitPct, totalPnL, totalPnLPct, botPnl }: PortfolioSummaryWidgetProps) {
return (
<>
<div className="p-3 grid grid-cols-2 gap-x-4 gap-y-3">
<StatRow neutral label="Total Balance" value={`$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
<StatRow neutral label="Investments" value={`$${investments.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
<StatRow positive label="Daily Profit" value={`+$${dailyProfit.toFixed(2)}`} />
<StatRow positive label="Total PnL" value={`+$${totalPnL.toFixed(2)} (+${totalPnLPct}%)`} />
<StatRow positive label="Bot P&L" value={`+$${botPnl.toFixed(2)}`} />
</div>
<div className="px-3 pb-2">
<Link to="/portfolio" className="text-[11px] font-medium text-primary">View full portfolio →</Link>
</div>
</>
);
}

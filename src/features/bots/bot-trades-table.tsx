import type { BotTrade } from "@/features/bots/types";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface BotTradesTableProps {
  trades: BotTrade[];
}

export function BotTradesTable({ trades }: BotTradesTableProps) {
  if (trades.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs text-muted-foreground">No trades recorded</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <tr>
          {["Side", "Price", "Qty", "P&L", "Time"].map((col) => (
            <TableHead key={col} className="text-[10px] font-normal uppercase tracking-wide">
              {col}
            </TableHead>
          ))}
        </tr>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow key={trade.id}>
            <TableCell>
              <span
                className={cn(
                  "font-mono font-semibold uppercase text-[10px]",
                  trade.side === "buy" ? "text-trading-bid" : "text-trading-ask",
                )}
              >
                {trade.side}
              </span>
            </TableCell>
            <TableCell className="font-mono">{trade.price.toLocaleString()}</TableCell>
            <TableCell className="font-mono">{trade.qty.toFixed(4)}</TableCell>
            <TableCell>
              <span
                className={cn(
                  "font-mono",
                  trade.pnl >= 0 ? "text-trading-profit" : "text-trading-loss",
                )}
              >
                {trade.pnl >= 0 ? "+" : ""}
                {trade.pnl.toFixed(2)}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(trade.executedAt).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

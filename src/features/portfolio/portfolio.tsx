import { Card, CardHeader } from "@/ui/card";
import { BalanceDisplay } from "./balance-display";
import { PositionCard } from "./position-card";
import type { Position } from "./position-card";

interface PortfolioState {
  totalBalance: number;
  availableBalance: number;
  unrealizedPnL: number;
  positions: Position[];
}

interface PortfolioProps {
  state: PortfolioState;
}

export function Portfolio({ state }: PortfolioProps) {
  return (
    <div className="flex flex-col w-full h-full space-y-4">
      <div>
        <h2 className="text-xl font-cypher font-bold mb-4">Portfolio</h2>
        <BalanceDisplay
          totalBalance={state.totalBalance}
          availableBalance={state.availableBalance}
          unrealizedPnL={state.unrealizedPnL}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Positions</h3>
        {state.positions.length > 0 ? (
          <div className="space-y-3">
            {state.positions.map((position) => (
              <PositionCard key={position.symbol} position={position} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">No positions</p>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

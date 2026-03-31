import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "@/ui/error-boundary";

import { TradingLayout } from "./-trading-layout";

export const Route = createFileRoute("/symbol/$symbol" as never)({
  component: RouteComponent,
});

function RouteComponent() {
  const { symbol } = Route.useParams();
  return (
    <ErrorBoundary>
      <title>{symbol} | Trading Engine</title>
      <TradingLayout symbol={symbol} />
    </ErrorBoundary>
  );
}

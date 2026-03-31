import { createFileRoute } from "@tanstack/react-router";

import { TradingLayout } from "./-trading-layout";

export const Route = createFileRoute("/symbol/$symbol" as never)({
  component: RouteComponent,
});

function RouteComponent() {
  const { symbol } = Route.useParams();
  return (
    <>
      <title>{symbol} | Trading Engine</title>
      <TradingLayout symbol={symbol} />
    </>
  );
}

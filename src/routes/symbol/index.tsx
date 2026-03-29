import { createFileRoute } from "@tanstack/react-router";
import { TradingLayout } from "@/routes/symbol/-trading-layout";

// biome-ignore lint/suspicious/noExplicitAny: TanStack Router type codegen not yet available
export const Route = createFileRoute("/symbol/:symbol" as any)({
  component: SymbolPage,
});

function SymbolPage() {
  const { symbol } = Route.useParams();

  return <TradingLayout symbol={symbol} />;
}

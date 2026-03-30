import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

const MOCK_NAV = {
  balance: 10_423.7,
  dailyPnLPct: 1.43,
};

function RootComponent() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* NavBar */}
      <header
        className="w-full border-b border-border shrink-0"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <div className="w-full px-4 h-12 flex items-center gap-4">
          {/* Logo */}
          <Link
            // biome-ignore lint/suspicious/noExplicitAny: codegen pending
            to={"/" as any}
            className="font-cypher text-sm font-bold tracking-widest select-none"
            style={{ color: "var(--t-primary)" }}
          >
            TRADETERM
          </Link>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Symbol tabs */}
          <nav className="flex items-center gap-1">
            {(["BTCUSDT", "ETHUSDT"] as const).map((sym) => (
              <Link
                key={sym}
                to={"/symbol/$symbol" as never}
                params={{ symbol: sym } as never}
                className="text-xs font-mono px-2.5 py-1 rounded transition-colors"
                activeProps={{
                  style: {
                    color: "var(--t-primary)",
                    backgroundColor: "var(--trading-bid-muted)",
                  },
                }}
                inactiveProps={{
                  style: { color: "var(--color-muted-foreground)" },
                }}
              >
                {sym}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Portfolio mini-preview */}
          <Link
            to="/portfolio"
            className="flex items-center gap-3 px-3 py-1 rounded border border-border/60 transition-colors hover:border-border text-xs font-mono"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <span className="tabular-nums font-semibold">
              $
              {MOCK_NAV.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="tabular-nums" style={{ color: "var(--trading-profit)" }}>
              +{MOCK_NAV.dailyPnLPct}%
            </span>
            <span className="text-[10px] text-muted-foreground">Portfolio →</span>
          </Link>

          <div className="w-px h-5 bg-border mx-1" />

          {/* DS link */}
          <Link
            to="/design-system"
            className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-border/40 transition-colors hover:border-border"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            DS
          </Link>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-1">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--trading-connected)" }}
            />
            <span
              className="text-[10px] font-mono uppercase"
              style={{ color: "var(--trading-connected)" }}
            >
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

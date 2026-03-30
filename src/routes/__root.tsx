import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

const SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;

function NavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header
      className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50"
      style={{ borderColor: "var(--trading-connected)" + "22" }}
    >
      <nav className="w-full max-w-7xl mx-auto px-4 h-12 flex items-center gap-6">
        {/* Logo */}
        <Link
          // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
          to={"/" as any}
          className="font-cypher text-sm font-bold tracking-widest uppercase"
          style={{ color: "var(--t-primary)" }}
        >
          Trading Engine
        </Link>

        <div className="h-4 w-px bg-border" />

        {/* Symbol tabs */}
        {SYMBOLS.map((sym) => {
          const active = pathname === `/symbol/${sym}`;
          return (
            <Link
              key={sym}
              // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
              to={"/symbol/$symbol" as any}
              // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
              params={{ symbol: sym } as any}
              className="font-mono text-xs tabular-nums transition-colors"
              style={{
                color: active ? "var(--t-primary)" : "var(--color-muted-foreground)",
              }}
            >
              {sym}
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Design system link */}
        <Link
          // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
          to={"/design-system" as any}
          className="font-mono text-[10px] uppercase tracking-widest transition-colors"
          style={{
            color:
              pathname === "/design-system" ? "var(--t-primary)" : "var(--color-muted-foreground)",
          }}
        >
          Design System
        </Link>

        {/* Connection status placeholder */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--trading-connected)" }}
          />
          <span className="font-mono text-[10px]" style={{ color: "var(--trading-connected)" }}>
            LIVE
          </span>
        </div>
      </nav>
    </header>
  );
}

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  ),
});

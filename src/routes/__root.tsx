import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { ThemeDropdown } from "@/features/theme/theme-dropdown";
import { MOCK_NAV } from "@/lib/mock-data";
import { Button } from "@/ui/button";
import { ErrorBoundary } from "@/ui/error-boundary";
import { LiveIndicator } from "@/ui/live-indicator";
import { SymbolSelector } from "@/ui/symbol-selector";
import { Logo } from "@/ui/logo";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-card">
          <p className="text-base font-semibold text-destructive">Application Error</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button intent="secondary" size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      )}
      onError={(error) => toast.error(error.message)}
    >
      <div className="min-h-screen flex flex-col bg-background">
        <header className="w-full border-b border-border shrink-0 bg-card">
          <div className="w-full px-4 h-12 flex items-center gap-4">
            <Link
              // biome-ignore lint/suspicious/noExplicitAny: codegen pending
              to={"/" as any}
              className="font-cypher text-sm font-bold tracking-widest select-none text-primary"
            >
              <Logo className="w-6 h-6 mr-2" />
              Trading Engine
            </Link>
            <div className="w-px h-5 bg-border mx-1" />
            <SymbolSelector />
            <div className="flex-1" />
            <Link
              to="/portfolio"
              className="flex items-center gap-3 px-3 py-1 rounded border border-border/60 transition-colors hover:border-border text-xs font-mono bg-background"
            >
              <span className="tabular-nums font-semibold">
                ${MOCK_NAV.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="tabular-nums text-trading-profit">+{MOCK_NAV.dailyPnLPct}%</span>
              <span className="text-[10px] text-muted-foreground">Portfolio →</span>
            </Link>
            <div className="w-px h-5 bg-border mx-1" />
            <ThemeDropdown />
            <LiveIndicator status="connected" className="ml-1" />
          </div>
        </header>
        <main className="flex-1 min-h-0">
          <Outlet />
        </main>
        <Toaster position="bottom-right" theme="system" richColors />
      </div>
    </ErrorBoundary>
  );
}

import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SYMBOL_CATEGORIES, SYMBOLS, type SymbolInfo } from "@/lib/symbols";

export function SymbolSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Derive current symbol from pathname
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const symbolMatch = pathname.match(/^\/symbol\/(.+)$/);
  const currentSymbol = symbolMatch?.[1];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on Escape, auto-focus search
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleSelect(symbol: string) {
    navigate({ to: "/symbol/$symbol" as never, params: { symbol } as never });
    setOpen(false);
    setSearch("");
  }

  const filtered = search
    ? SYMBOLS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.base.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border border-border/60 hover:border-border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--t-primary)]"
        style={{ color: currentSymbol ? "var(--t-primary)" : "var(--color-muted-foreground)" }}
      >
        <span className="font-semibold">{currentSymbol ?? "SELECT PAIR"}</span>
        <span className="text-[10px] opacity-60">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-56 rounded border border-border shadow-xl font-mono text-xs"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          {/* Search input */}
          <div className="px-2 py-1.5 border-b border-border">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-xs font-mono focus:outline-none"
            />
          </div>

          {/* Symbol list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered ? (
              filtered.length > 0 ? (
                filtered.map((s) => (
                  <SymbolRow
                    key={s.symbol}
                    info={s}
                    active={s.symbol === currentSymbol}
                    onSelect={handleSelect}
                  />
                ))
              ) : (
                <div className="px-3 py-2 text-muted-foreground">No results</div>
              )
            ) : (
              SYMBOL_CATEGORIES.filter((cat) => SYMBOLS.some((s) => s.category === cat)).map(
                (cat) => (
                  <div key={cat}>
                    <div className="px-3 pt-2 pb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {cat} pairs
                    </div>
                    {SYMBOLS.filter((s) => s.category === cat).map((s) => (
                      <SymbolRow
                        key={s.symbol}
                        info={s}
                        active={s.symbol === currentSymbol}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SymbolRowProps {
  info: SymbolInfo;
  active: boolean;
  onSelect: (symbol: string) => void;
}

function SymbolRow({ info, active, onSelect }: SymbolRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(info.symbol)}
      className="w-full text-left px-3 py-1.5 flex items-center gap-1 hover:bg-muted/60 transition-colors"
      style={
        active
          ? { color: "var(--t-primary)", backgroundColor: "var(--trading-bid-muted)" }
          : undefined
      }
    >
      <span className="font-semibold tabular-nums">{info.base}</span>
      <span className="text-muted-foreground">/{info.quote}</span>
      {active && (
        <span className="ml-auto text-[10px]" style={{ color: "var(--t-primary)" }}>
          ●
        </span>
      )}
    </button>
  );
}

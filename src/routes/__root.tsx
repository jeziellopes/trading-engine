import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Check, ChevronDown, Moon, Sun, Zap } from "lucide-react";
import { SymbolSelector } from "@/ui/symbol-selector";
import { toast, Toaster } from "sonner";
import { ErrorBoundary } from "@/ui/error-boundary";
import { MOCK_NAV } from "@/lib/mock-data";
import { Button } from "@/ui/button";

type ThemeId = "soft" | "night-city" | "maelstrom" | "corpo-ice" | "netrunner" | "flowa";
type ModeId = "dark" | "light" | "vibrant";

const THEME_STORAGE_KEY = "trading-theme";
const MODE_STORAGE_KEY  = "trading-mode";

const THEMES: { id: ThemeId; label: string; accent: string }[] = [
  { id: "soft",       label: "Soft",       accent: "oklch(0.62 0.22 280)" },
  { id: "night-city", label: "Night City", accent: "oklch(0.68 0.22 95)"  },
  { id: "maelstrom",  label: "Maelstrom",  accent: "oklch(0.56 0.28 316)" },
  { id: "corpo-ice",  label: "Corpo Ice",  accent: "oklch(0.88 0.18 215)" },
  { id: "netrunner",  label: "Netrunner",  accent: "oklch(0.62 0.22 280)" },
  { id: "flowa",      label: "Flowa",      accent: "oklch(0.44 0.31 285)" },
];

const MODES: { id: ModeId; icon: ReactNode; label: string }[] = [
  { id: "dark",    icon: <Moon size={11} />,  label: "Dark"    },
  { id: "light",   icon: <Sun size={11} />,   label: "Light"   },
  { id: "vibrant", icon: <Zap size={11} />,   label: "Vibrant" },
];

function applyTheme(theme: ThemeId, mode: ModeId) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.setAttribute("data-mode", mode);
  if (mode === "light") el.classList.remove("dark");
  else el.classList.add("dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  localStorage.setItem(MODE_STORAGE_KEY, mode);
}

function ThemeDropdown() {
  const [theme, setThemeState] = useState<ThemeId>("night-city");
  const [mode, setModeState]   = useState<ModeId>("dark");
  const [open, setOpen]        = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null)
      ?? (document.documentElement.getAttribute("data-theme") as ThemeId | null)
      ?? "night-city";
    const m = (localStorage.getItem(MODE_STORAGE_KEY) as ModeId | null)
      ?? (document.documentElement.getAttribute("data-mode") as ModeId | null)
      ?? "dark";
    if (THEMES.some((x) => x.id === t)) setThemeState(t as ThemeId);
    setModeState(m as ModeId);
  }, []);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const current = THEMES.find((t) => t.id === theme);

  function selectTheme(t: ThemeId) {
    setThemeState(t);
    applyTheme(t, mode);
    setOpen(false);
  }

  function selectMode(m: ModeId) {
    setModeState(m);
    applyTheme(theme, m);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/40 hover:border-border transition-colors cursor-pointer"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: current?.accent }} />
        <span className="text-[10px] font-mono uppercase tracking-wider">{current?.label ?? theme}</span>
        <ChevronDown
          size={10}
          style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border shadow-lg z-50 overflow-hidden"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          {/* Theme list */}
          <div className="py-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTheme(t.id)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors cursor-pointer text-left"
                style={{ color: t.id === theme ? "var(--primary)" : "var(--color-foreground)" }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.accent }} />
                <span className="flex-1 font-mono">{t.label}</span>
                {t.id === theme && <Check size={10} />}
              </button>
            ))}
          </div>

          {/* Mode row */}
          <div className="border-t border-border/40 px-3 py-2 flex items-center gap-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                title={m.label}
                aria-label={m.label}
                className="flex items-center justify-center flex-1 h-6 rounded cursor-pointer transition-colors"
                style={{
                  backgroundColor: m.id === mode ? "var(--primary)" : "transparent",
                  color: m.id === mode ? "var(--primary-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                {m.icon}
              </button>
            ))}
          </div>

          {/* Divider + DS link */}
          <div className="border-t border-border/40 py-1">
            <Link
              to="/design-system"
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Design System
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

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
            style={{ color: "var(--primary)" }}
          >
            Trading Engine
          </Link>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Symbol selector */}
          <SymbolSelector />

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

          <ThemeDropdown />

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
      <Toaster position="bottom-right" theme="system" richColors />
    </div>
    </ErrorBoundary>
  );
}

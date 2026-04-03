import { createContext, use } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// ── Context ───────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: "pill" | "underline";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error("<Tab> must be inside <TabList>");
  return ctx;
}

// ── TabList ───────────────────────────────────────────────────────────────────

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  /** Visual variant. Defaults to "pill" (filled capsule). Use "underline" for Binance-style indicator tabs. */
  variant?: "pill" | "underline";
  /** When true, suppresses the bottom border on the underline variant (use when hosted inside a container that already has a border-b). */
  noBorder?: boolean;
}

export function TabList({
  value,
  onValueChange,
  variant = "pill",
  noBorder = false,
  className,
  children,
  ...props
}: TabListProps) {
  return (
    <TabsContext value={{ value, onValueChange, variant }}>
      <div
        role="tablist"
        className={cn(
          variant === "pill" && "flex gap-1.5 bg-muted p-1 rounded-md",
          variant === "underline" && cn("flex", !noBorder && "border-b border-border"),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function Tab({ value, children, className, ...props }: TabProps) {
  const { value: activeValue, onValueChange, variant } = useTabsContext();
  const isActive = value === activeValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const tablist = e.currentTarget.closest('[role="tablist"]');
    const allTabs = Array.from(tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const idx = allTabs.findIndex((t) => t.dataset.tab === value);
    const next =
      e.key === "ArrowRight"
        ? allTabs[(idx + 1) % allTabs.length]
        : allTabs[(idx - 1 + allTabs.length) % allTabs.length];
    if (next?.dataset.tab) {
      onValueChange(next.dataset.tab);
      next.focus();
    }
    props.onKeyDown?.(e);
  };

  if (variant === "underline") {
    return (
      <button
        type="button"
        role="tab"
        data-tab={value}
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onValueChange(value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "px-3 py-2 text-sm -mb-px border-b-2 transition-colors",
          isActive
            ? "border-primary text-foreground font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <Button
      type="button"
      role="tab"
      data-tab={value}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      intent={isActive ? "primary" : "segment"}
      size="sm"
      onClick={() => onValueChange(value)}
      onKeyDown={handleKeyDown}
      className={cn("flex-1 rounded-sm", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

// ── TabPanel ──────────────────────────────────────────────────────────────────

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue: string;
}

export function TabPanel({ value, activeValue, className, children, ...props }: TabPanelProps) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

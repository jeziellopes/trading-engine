import { createContext, use } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// ── Context ───────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
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
}

export function TabList({ value, onValueChange, className, children, ...props }: TabListProps) {
  return (
    <TabsContext value={{ value, onValueChange }}>
      <div
        role="tablist"
        className={cn("flex gap-1.5 bg-muted p-1 rounded-md", className)}
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
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = value === activeValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    // Query sibling tabs from the DOM at event time — no render-time ref mutation
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

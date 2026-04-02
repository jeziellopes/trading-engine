import { createContext, use, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// ── Context ───────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  tabs: React.RefObject<string[]>;
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
  const tabs = useRef<string[]>([]);
  tabs.current = []; // reset on each render — Tab children repopulate via registration

  return (
    <TabsContext value={{ value, onValueChange, tabs }}>
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
  const { value: activeValue, onValueChange, tabs } = useTabsContext();

  // Register this tab value in order (runs during render — tabs.current reset each render)
  if (!tabs.current.includes(value)) tabs.current.push(value);

  const isActive = value === activeValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const list = tabs.current;
    const idx = list.indexOf(value);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = list[(idx + 1) % list.length];
      onValueChange(next);
      document.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = list[(idx - 1 + list.length) % list.length];
      onValueChange(prev);
      document.querySelector<HTMLButtonElement>(`[data-tab="${prev}"]`)?.focus();
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

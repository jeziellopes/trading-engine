import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  children: ReactNode;
  /** Disable inner scroll — use for chart panels that must fill height */
  noScroll?: boolean;
  /** Extra content rendered inline in the header (e.g. timeframe tabs) */
  headerExtra?: ReactNode;
  className?: string;
}

export function Panel({ title, children, noScroll = false, headerExtra, className }: PanelProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-md border border-border flex flex-col h-full overflow-hidden",
        className,
      )}
    >
      <div className="px-3 py-2 border-b border-border shrink-0 cursor-move flex items-center justify-between gap-2">
        <h2 className="text-xs font-cypher font-semibold tracking-wide uppercase text-muted-foreground select-none">
          {title}
        </h2>
        {headerExtra}
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          noScroll ? "flex flex-col overflow-hidden" : "overflow-y-auto",
        )}
      >
        {children}
      </div>
    </div>
  );
}

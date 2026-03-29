import { cn } from "@/lib/utils";

interface ConnectionBannerProps {
  status: "connected" | "reconnecting" | "disconnected";
}

export function ConnectionBanner({ status }: ConnectionBannerProps) {
  if (status === "connected") return null;

  const base = "w-full py-1 px-3 text-xs font-mono flex items-center gap-2 border-b";

  if (status === "reconnecting") {
    return (
      <div
        className={cn(base)}
        style={{
          backgroundColor: "oklch(0.75 0.16 75 / 0.1)",
          borderColor: "oklch(0.75 0.16 75 / 0.3)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
          style={{ backgroundColor: "var(--trading-reconnecting)" }}
        />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(base)}
      style={{
        backgroundColor: "oklch(0.60 0.22 25 / 0.1)",
        borderColor: "oklch(0.60 0.22 25 / 0.3)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: "var(--trading-disconnected)" }}
      />
      <span>Disconnected — check connection</span>
    </div>
  );
}

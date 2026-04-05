import { useState } from "react";
import type { NormalizedTrade } from "@/domain/market-data/normalized";
import { BotManagerPanel } from "@/features/bots/bot-manager-panel";
import type { BotInstance, BotStatus } from "@/features/bots/types";
import { TradesFeed } from "@/features/trades/trades-feed";
import { cn } from "@/lib/utils";
import { Tab, TabList } from "@/ui/tabs";

interface DataPanelProps {
  bots: BotInstance[];
  trades: NormalizedTrade[];
  onBotStatusChange: (id: string, status: BotStatus) => void;
  className?: string;
}

const TABS = [
  { value: "trades", label: "Trades" },
  { value: "bots", label: "Bots" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/** Self-contained panel — owns its own chrome matching Panel header height/typography. */
export function DataPanel({ bots, trades, onBotStatusChange, className }: DataPanelProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("trades");

  return (
    <div
      className={cn(
        "bg-card rounded-md border border-border flex flex-col h-full overflow-hidden",
        className,
      )}
    >
      <div className="border-b border-border shrink-0 cursor-move">
        <TabList
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          aria-label="Data panel"
          variant="header"
        >
          {TABS.map((t) => (
            <Tab key={t.value} value={t.value}>
              {t.label}
            </Tab>
          ))}
        </TabList>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "trades" && <TradesFeed trades={trades} />}
        {activeTab === "bots" && <BotManagerPanel bots={bots} onStatusChange={onBotStatusChange} />}
      </div>
    </div>
  );
}

import { useState } from "react";
import { BotManagerPanel } from "@/features/bots/bot-manager-panel";
import type { BotInstance, BotStatus } from "@/features/bots/types";
import { RecentTradesTable } from "@/features/trades/recent-trades-table";
import type { TradingLayoutTrade } from "@/lib/mock-data";
import { Tab, TabList } from "@/ui/tabs";

interface DataPanelProps {
  bots: BotInstance[];
  trades: TradingLayoutTrade[];
  onBotStatusChange: (id: string, status: BotStatus) => void;
}

const TABS = [
  { value: "trades", label: "Trades" },
  { value: "bots", label: "Bots" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function DataPanel({ bots, trades, onBotStatusChange }: DataPanelProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("trades");

  return (
    <div className="h-full flex flex-col">
      <TabList
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        aria-label="Data panel"
        variant="underline"
        className="px-3 shrink-0"
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value}>
            {t.label}
          </Tab>
        ))}
      </TabList>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "trades" && <RecentTradesTable trades={trades} />}
        {activeTab === "bots" && <BotManagerPanel bots={bots} onStatusChange={onBotStatusChange} />}
      </div>
    </div>
  );
}

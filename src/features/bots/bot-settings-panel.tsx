import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select } from "@/ui/select";
import type { BotStrategy } from "./types";

const STRATEGIES: BotStrategy[] = ["grid", "dca", "rsi", "macd"];

interface BotSettingsData {
  name: string;
  strategy: BotStrategy;
  symbol: string;
  startedAt: number;
}

interface BotSettingsPanelProps {
  data: BotSettingsData;
  onSave: (data: BotSettingsData) => void;
  className?: string;
}

export function BotSettingsPanel({ data, onSave, className }: BotSettingsPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BotSettingsData>(data);

  function startEdit() {
    setDraft(data);
    setEditing(true);
  }

  function saveEdit() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <div className={cn("rounded-md border border-border/60 p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Settings</p>
        {!editing ? (
          <Button
            intent="ghost"
            size="xs"
            type="button"
            onClick={startEdit}
            className="w-6 h-6 p-0"
            title="Edit settings"
            aria-label="Edit settings"
          >
            <Pencil size={11} />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              intent="ghost"
              size="xs"
              type="button"
              onClick={saveEdit}
              className="w-6 h-6 p-0 text-trading-profit"
              title="Save"
              aria-label="Save settings"
            >
              <Check size={11} />
            </Button>
            <Button
              intent="ghost"
              size="xs"
              type="button"
              onClick={() => setEditing(false)}
              className="w-6 h-6 p-0"
              title="Cancel"
              aria-label="Cancel edit"
            >
              <X size={11} />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="bot-name-input" className="text-[10px] uppercase tracking-wide">
            Name
          </Label>
          {editing ? (
            <Input
              id="bot-name-input"
              size="sm"
              className="font-mono text-xs"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          ) : (
            <p className="text-xs font-mono">{data.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bot-strategy-select" className="text-[10px] uppercase tracking-wide">
            Strategy
          </Label>
          {editing ? (
            <Select
              id="bot-strategy-select"
              className="font-mono text-xs"
              value={draft.strategy}
              onChange={(e) => setDraft({ ...draft, strategy: e.target.value as BotStrategy })}
            >
              {STRATEGIES.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </Select>
          ) : (
            <p className="text-xs font-mono uppercase">{data.strategy}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bot-symbol-input" className="text-[10px] uppercase tracking-wide">
            Symbol
          </Label>
          {editing ? (
            <Input
              id="bot-symbol-input"
              size="sm"
              className="font-mono text-xs"
              value={draft.symbol}
              onChange={(e) => setDraft({ ...draft, symbol: e.target.value.toUpperCase() })}
            />
          ) : (
            <p className="text-xs font-mono">{data.symbol}</p>
          )}
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Started</p>
          <p className="text-xs font-mono text-muted-foreground">
            {new Date(data.startedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

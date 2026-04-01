import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
<button
type="button"
onClick={startEdit}
className="flex items-center gap-1 w-6 h-6 rounded justify-center cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
title="Edit settings"
aria-label="Edit settings"
>
<Pencil size={11} />
</button>
) : (
<div className="flex gap-1">
<button
type="button"
onClick={saveEdit}
className="flex items-center justify-center w-6 h-6 rounded cursor-pointer text-trading-profit hover:bg-muted transition-colors"
title="Save"
aria-label="Save settings"
>
<Check size={11} />
</button>
<button
type="button"
onClick={() => setEditing(false)}
className="flex items-center justify-center w-6 h-6 rounded cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
title="Cancel"
aria-label="Cancel edit"
>
<X size={11} />
</button>
</div>
)}
</div>

<div className="space-y-3">
<div>
<label htmlFor="bot-name-input" className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
Name
</label>
{editing ? (
<input
id="bot-name-input"
className="w-full rounded border border-border bg-card px-2 py-1 text-xs font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
value={draft.name}
onChange={(e) => setDraft({ ...draft, name: e.target.value })}
/>
) : (
<p className="text-xs font-mono">{data.name}</p>
)}
</div>

<div>
<label htmlFor="bot-strategy-select" className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
Strategy
</label>
{editing ? (
<select
id="bot-strategy-select"
className="w-full rounded border border-border bg-card px-2 py-1 text-xs font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring cursor-pointer"
value={draft.strategy}
onChange={(e) => setDraft({ ...draft, strategy: e.target.value as BotStrategy })}
>
{STRATEGIES.map((s) => (
<option key={s} value={s}>
{s.toUpperCase()}
</option>
))}
</select>
) : (
<p className="text-xs font-mono uppercase">{data.strategy}</p>
)}
</div>

<div>
<label htmlFor="bot-symbol-input" className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
Symbol
</label>
{editing ? (
<input
id="bot-symbol-input"
className="w-full rounded border border-border bg-card px-2 py-1 text-xs font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
value={draft.symbol}
onChange={(e) => setDraft({ ...draft, symbol: e.target.value.toUpperCase() })}
/>
) : (
<p className="text-xs font-mono">{data.symbol}</p>
)}
</div>

<div>
<label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
Started
</label>
<p className="text-xs font-mono text-muted-foreground">
{new Date(data.startedAt).toLocaleString()}
</p>
</div>
</div>
</div>
);
}

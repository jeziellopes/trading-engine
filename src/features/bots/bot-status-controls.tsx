import { Pause, Play, Square } from "lucide-react";
import type { BotStatus } from "./types";

interface BotStatusControlsProps {
status: BotStatus;
onStatusChange: (status: BotStatus) => void;
}

export function BotStatusControls({ status, onStatusChange }: BotStatusControlsProps) {
return (
<div className="flex items-center gap-1">
{status !== "running" && (
<button type="button" onClick={() => onStatusChange("running")} className="flex items-center gap-1.5 px-3 h-7 rounded text-xs cursor-pointer text-trading-bid hover:bg-muted transition-colors">
<Play size={11} /> Run
</button>
)}
{status === "running" && (
<button type="button" onClick={() => onStatusChange("paused")} className="flex items-center gap-1.5 px-3 h-7 rounded text-xs cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
<Pause size={11} /> Pause
</button>
)}
{status !== "stopped" && (
<button type="button" onClick={() => onStatusChange("stopped")} className="flex items-center gap-1.5 px-3 h-7 rounded text-xs cursor-pointer text-trading-ask hover:bg-muted transition-colors">
<Square size={11} /> Stop
</button>
)}
</div>
);
}

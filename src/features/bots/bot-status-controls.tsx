import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/ui/button";
import type { BotStatus } from "./types";

interface BotStatusControlsProps {
  status: BotStatus;
  onStatusChange: (status: BotStatus) => void;
}

export function BotStatusControls({ status, onStatusChange }: BotStatusControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {status !== "running" && (
        <Button
          intent="ghost"
          size="xs"
          type="button"
          onClick={() => onStatusChange("running")}
          className="text-trading-bid hover:text-trading-bid"
        >
          <Play size={11} /> Run
        </Button>
      )}
      {status === "running" && (
        <Button intent="ghost" size="xs" type="button" onClick={() => onStatusChange("paused")}>
          <Pause size={11} /> Pause
        </Button>
      )}
      {status !== "stopped" && (
        <Button
          intent="ghost"
          size="xs"
          type="button"
          onClick={() => onStatusChange("stopped")}
          className="text-trading-ask hover:text-trading-ask"
        >
          <Square size={11} /> Stop
        </Button>
      )}
    </div>
  );
}

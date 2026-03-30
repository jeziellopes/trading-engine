import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BotCard } from "./bot-card";
import type { BotInstance } from "./types";

const runningBot: BotInstance = {
  id: "bot-1",
  name: "Grid BTC #1",
  strategy: "grid",
  symbol: "BTCUSDT",
  status: "running",
  startedAt: Date.now() - 1000 * 60 * 60 * 3,
  unrealizedPnl: 84.2,
  realizedPnl: 218.5,
  tradeCount: 47,
  winCount: 33,
  entryPrice: 67200,
  currentPrice: 67843.5,
  pnlHistory: [0, 45, 38, 82, 110, 95, 148, 190, 210, 302.7],
};

const pausedBot: BotInstance = {
  ...runningBot,
  id: "bot-2",
  name: "DCA ETH #1",
  strategy: "dca",
  status: "paused",
};

const stoppedBot: BotInstance = {
  ...runningBot,
  id: "bot-3",
  name: "RSI SOL #1",
  strategy: "rsi",
  status: "stopped",
  entryPrice: undefined,
  currentPrice: undefined,
};

describe("BotCard", () => {
  it("renders bot name and strategy", () => {
    render(<BotCard bot={runningBot} onStatusChange={vi.fn()} />);
    expect(screen.getByText("Grid BTC #1")).toBeInTheDocument();
    expect(screen.getByText("grid")).toBeInTheDocument();
  });

  it("shows running status badge", () => {
    render(<BotCard bot={runningBot} onStatusChange={vi.fn()} />);
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("shows pause and stop buttons when running", () => {
    render(<BotCard bot={runningBot} onStatusChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /run/i })).not.toBeInTheDocument();
  });

  it("shows run and stop buttons when paused", () => {
    render(<BotCard bot={pausedBot} onStatusChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /run/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pause/i })).not.toBeInTheDocument();
  });

  it("shows only run button when stopped", () => {
    render(<BotCard bot={stoppedBot} onStatusChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /run/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /stop/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pause/i })).not.toBeInTheDocument();
  });

  it("calls onStatusChange with paused when pause clicked", async () => {
    const onStatusChange = vi.fn();
    render(<BotCard bot={runningBot} onStatusChange={onStatusChange} />);
    await userEvent.click(screen.getByRole("button", { name: /pause/i }));
    expect(onStatusChange).toHaveBeenCalledWith("bot-1", "paused");
  });

  it("calls onStatusChange with running when run clicked", async () => {
    const onStatusChange = vi.fn();
    render(<BotCard bot={pausedBot} onStatusChange={onStatusChange} />);
    await userEvent.click(screen.getByRole("button", { name: /run/i }));
    expect(onStatusChange).toHaveBeenCalledWith("bot-2", "running");
  });
});

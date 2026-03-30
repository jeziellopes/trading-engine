import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BotManagerPanel } from "./bot-manager-panel";
import type { BotInstance, BotStatus, BotStrategy } from "./types";

vi.mock("./bot-card", () => ({
  BotCard: ({ bot }: { bot: { name: string } }) => (
    <div data-testid="bot-card">{bot.name}</div>
  ),
}));

function makeBots(overrides: Partial<BotInstance>[] = []): BotInstance[] {
  return overrides.map((o, i) => ({
    id: `bot-${i}`,
    name: `Bot ${i}`,
    strategy: "grid" as BotStrategy,
    symbol: "BTCUSDT",
    status: "running" as BotStatus,
    startedAt: Date.now() - 1000 * 60 * 60,
    unrealizedPnl: 0,
    realizedPnl: 0,
    tradeCount: 0,
    winCount: 0,
    pnlHistory: [0],
    ...o,
  }));
}

describe("BotManagerPanel", () => {
  it("renders all bot cards", () => {
    const bots = makeBots([{}, {}, {}]);
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getAllByTestId("bot-card")).toHaveLength(3);
  });

  it("shows correct running count", () => {
    const bots = makeBots([
      { status: "running" },
      { status: "running" },
      { status: "paused" },
    ]);
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/2 running/)).toBeInTheDocument();
  });

  it("shows zero running when all stopped", () => {
    const bots = makeBots([
      { status: "stopped" },
      { status: "stopped" },
      { status: "stopped" },
    ]);
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/0 running/)).toBeInTheDocument();
  });

  it("total P&L sums realizedPnl + unrealizedPnl across all bots", () => {
    const bots = makeBots([
      { realizedPnl: 100, unrealizedPnl: 25.5 },
      { realizedPnl: 50, unrealizedPnl: -10.25 },
      { realizedPnl: 20, unrealizedPnl: 5 },
    ]);
    // total = (100 + 25.5) + (50 - 10.25) + (20 + 5) = 190.25
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/190\.25 total P&L/)).toBeInTheDocument();
  });

  it("total P&L shows + prefix when positive", () => {
    const bots = makeBots([
      { realizedPnl: 200, unrealizedPnl: 50 },
    ]);
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/\+250\.00 total P&L/)).toBeInTheDocument();
  });

  it("total P&L shows no + prefix when negative", () => {
    const bots = makeBots([
      { realizedPnl: -100, unrealizedPnl: -30 },
    ]);
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    const text = screen.getByText(/-130\.00 total P&L/);
    expect(text).toBeInTheDocument();
    expect(text.textContent).not.toMatch(/\+/);
  });

  it("win rate is total winCount / total tradeCount * 100", () => {
    const bots = makeBots([
      { tradeCount: 6, winCount: 3 },
      { tradeCount: 4, winCount: 3 },
    ]);
    // 6 wins / 10 trades = 60%
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/60% win rate/)).toBeInTheDocument();
  });

  it("win rate shows 0% when no trades", () => {
    const bots = makeBots([
      { tradeCount: 0, winCount: 0 },
      { tradeCount: 0, winCount: 0 },
    ]);
    render(<BotManagerPanel bots={bots} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/0% win rate/)).toBeInTheDocument();
  });

  it("renders empty state gracefully when no bots", () => {
    render(<BotManagerPanel bots={[]} onStatusChange={vi.fn()} />);
    expect(screen.queryAllByTestId("bot-card")).toHaveLength(0);
    expect(screen.getByText(/0 running/)).toBeInTheDocument();
  });
});

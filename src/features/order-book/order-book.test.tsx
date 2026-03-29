import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderBook } from "./order-book";

describe("OrderBook", () => {
  const mockState = {
    bids: [
      { price: 42502.0, quantity: 1.5, total: 63753.0, percent: 55 },
      { price: 42501.0, quantity: 2.2, total: 93502.2, percent: 45 },
    ],
    asks: [
      { price: 42504.0, quantity: 1.0, total: 42504.0, percent: 40 },
      { price: 42505.0, quantity: 2.5, total: 106262.5, percent: 60 },
    ],
    bestBid: 42502.0,
    bestAsk: 42504.0,
    lastPrice: 42503.0,
    spreadAmount: 2.0,
    spreadPercent: 0.0047,
    connectionStatus: "connected" as const,
    lastPriceTick: "up" as const,
  };

  it("renders connection banner", () => {
    const state = { ...mockState, connectionStatus: "reconnecting" as const };
    render(<OrderBook state={state} />);
    expect(screen.getByText(/Reconnecting/)).toBeInTheDocument();
  });

  it("renders spread bar", () => {
    render(<OrderBook state={mockState} />);
    expect(screen.getByText(/Spread:/)).toBeInTheDocument();
  });

  it("renders bid and ask tables", () => {
    const { container } = render(<OrderBook state={mockState} />);
    // Should have bids and asks
    const allText = container.textContent;
    expect(allText).toContain("42502.00"); // bid
    expect(allText).toContain("42504.00"); // ask
  });

  it("applies correct container styling", () => {
    const { container } = render(<OrderBook state={mockState} />);
    const orderbook = container.firstChild;
    expect(orderbook).toHaveClass("flex", "flex-col", "w-full", "h-full", "font-mono", "text-sm");
  });
});

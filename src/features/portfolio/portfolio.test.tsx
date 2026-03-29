import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Portfolio } from "./portfolio";

describe("Portfolio", () => {
  const mockState = {
    totalBalance: 10000.0,
    availableBalance: 5000.0,
    unrealizedPnL: 1500.0,
    positions: [
      {
        symbol: "BTCUSDT",
        quantity: 0.5,
        entryPrice: 42000.0,
        markPrice: 42500.0,
        unrealizedPnL: 250.0,
        unrealizedPnLPercent: 0.595,
      },
      {
        symbol: "ETHUSDT",
        quantity: 5.0,
        entryPrice: 2400.0,
        markPrice: 2410.0,
        unrealizedPnL: 50.0,
        unrealizedPnLPercent: 0.208,
      },
    ],
  };

  it("renders portfolio title", () => {
    render(<Portfolio state={mockState} />);
    expect(screen.getByText(/Portfolio/)).toBeInTheDocument();
  });

  it("renders balance display", () => {
    render(<Portfolio state={mockState} />);
    expect(screen.getByText(/Total Balance/)).toBeInTheDocument();
    expect(screen.getByText(/10000\.00/)).toBeInTheDocument();
  });

  it("renders all positions", () => {
    render(<Portfolio state={mockState} />);
    expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
    expect(screen.getByText("ETHUSDT")).toBeInTheDocument();
  });

  it("renders empty message when no positions", () => {
    const emptyState = {
      ...mockState,
      positions: [],
    };
    render(<Portfolio state={emptyState} />);
    expect(screen.getByText(/No positions/)).toBeInTheDocument();
  });
});

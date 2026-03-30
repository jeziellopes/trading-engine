import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PositionCard } from "./position-card";

describe("PositionCard", () => {
  const mockPosition = {
    symbol: "BTCUSDT",
    quantity: 0.5,
    entryPrice: 42000.0,
    markPrice: 42500.0,
    unrealizedPnL: 250.0,
    unrealizedPnLPercent: 0.595,
  };

  it("renders symbol and quantity", () => {
    render(<PositionCard position={mockPosition} />);
    expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
    expect(screen.getByText(/0.50/)).toBeInTheDocument();
  });

  it("renders entry and mark price", () => {
    render(<PositionCard position={mockPosition} />);
    expect(screen.getByText(/42000\.00/)).toBeInTheDocument();
    expect(screen.getByText(/42500\.00/)).toBeInTheDocument();
  });

  it("renders positive PnL with profit color", () => {
    render(<PositionCard position={mockPosition} />);
    const pnlText = screen.getByText(/250\.00/);
    expect(pnlText).toHaveClass("text-[color:var(--trading-profit)]");
  });

  it("renders negative PnL with loss color", () => {
    const negativePnL = {
      ...mockPosition,
      unrealizedPnL: -100.0,
      unrealizedPnLPercent: -0.238,
    };
    render(<PositionCard position={negativePnL} />);
    const pnlText = screen.getByText(/-100\.00/);
    expect(pnlText).toHaveClass("text-[color:var(--trading-loss)]");
  });

  it("renders PnL percentage", () => {
    render(<PositionCard position={mockPosition} />);
    expect(screen.getByText(/0\.595%/)).toBeInTheDocument();
  });
});

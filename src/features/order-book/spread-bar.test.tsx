import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpreadBar } from "./spread-bar";

describe("SpreadBar", () => {
  it("renders spread value and percentage", () => {
    render(
      <SpreadBar
        bestBid={42500.5}
        bestAsk={42502.5}
        lastPrice={42501.0}
        spreadAmount={2.0}
        spreadPercent={0.0047}
      />,
    );
    expect(screen.getByText(/Spread:/)).toBeInTheDocument();
    expect(screen.getByText(/2.00/)).toBeInTheDocument();
    expect(screen.getByText(/0.0047%/)).toBeInTheDocument();
  });

  it("renders last price with tick direction", () => {
    render(
      <SpreadBar
        bestBid={42500.5}
        bestAsk={42502.5}
        lastPrice={42501.0}
        spreadAmount={2.0}
        spreadPercent={0.0047}
        tickDirection="up"
      />,
    );
    expect(screen.getByText(/42501.00/)).toBeInTheDocument();
    expect(screen.getByText("↑")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <SpreadBar
        bestBid={42500.5}
        bestAsk={42502.5}
        lastPrice={42501.0}
        spreadAmount={2.0}
        spreadPercent={0.0047}
      />,
    );
    const bar = container.firstChild;
    expect(bar).toHaveClass("flex", "items-center", "justify-between", "text-xs", "font-mono");
  });

  it("renders tick down with down arrow", () => {
    render(
      <SpreadBar
        bestBid={42500.5}
        bestAsk={42502.5}
        lastPrice={42501.0}
        spreadAmount={2.0}
        spreadPercent={0.0047}
        tickDirection="down"
      />,
    );
    expect(screen.getByText("↓")).toBeInTheDocument();
  });

  it("renders tick neutral with dash", () => {
    render(
      <SpreadBar
        bestBid={42500.5}
        bestAsk={42502.5}
        lastPrice={42501.0}
        spreadAmount={2.0}
        spreadPercent={0.0047}
        tickDirection="neutral"
      />,
    );
    expect(screen.getByText("–")).toBeInTheDocument();
  });
});

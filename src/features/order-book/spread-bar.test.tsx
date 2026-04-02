import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpreadBar } from "./spread-bar";

describe("SpreadBar", () => {
  const defaultProps = {
    spread: { amount: 2.0, percent: 0.0047 },
    lastPrice: 42501.0,
  };

  it("renders spread value and percentage", () => {
    render(<SpreadBar {...defaultProps} />);
    expect(screen.getByText(/Spread:/)).toBeInTheDocument();
    expect(screen.getByText(/2.00/)).toBeInTheDocument();
    expect(screen.getByText(/0.0047%/)).toBeInTheDocument();
  });

  it("renders last price with tick direction up", () => {
    render(<SpreadBar {...defaultProps} tickDirection="up" />);
    expect(screen.getByText(/42501.00/)).toBeInTheDocument();
    expect(screen.getByText("↑")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(<SpreadBar {...defaultProps} />);
    const bar = container.firstChild;
    expect(bar).toHaveClass("flex", "items-center", "justify-between", "text-xs", "font-mono");
  });

  it("renders tick down with down arrow", () => {
    render(<SpreadBar {...defaultProps} tickDirection="down" />);
    expect(screen.getByText("↓")).toBeInTheDocument();
  });

  it("renders tick neutral with dash", () => {
    render(<SpreadBar {...defaultProps} tickDirection="neutral" />);
    expect(screen.getByText("–")).toBeInTheDocument();
  });
});

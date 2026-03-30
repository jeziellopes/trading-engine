import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BalanceDisplay } from "./balance-display";

describe("BalanceDisplay", () => {
  it("renders total balance", () => {
    render(
      <BalanceDisplay totalBalance={10000.0} availableBalance={5000.0} unrealizedPnL={1500.0} />,
    );
    expect(screen.getByText(/Total/)).toBeInTheDocument();
    expect(screen.getByText(/10000\.00/)).toBeInTheDocument();
  });

  it("renders available balance", () => {
    render(
      <BalanceDisplay totalBalance={10000.0} availableBalance={5000.0} unrealizedPnL={1500.0} />,
    );
    expect(screen.getByText(/Available/)).toBeInTheDocument();
    expect(screen.getByText(/5000\.00/)).toBeInTheDocument();
  });

  it("renders positive PnL with profit color", () => {
    render(
      <BalanceDisplay totalBalance={10000.0} availableBalance={5000.0} unrealizedPnL={1500.0} />,
    );
    const pnlElement = screen.getByText(/1500\.00/);
    expect(pnlElement).toHaveClass("text-[color:var(--trading-profit)]");
  });

  it("renders negative PnL with loss color", () => {
    render(
      <BalanceDisplay totalBalance={10000.0} availableBalance={5000.0} unrealizedPnL={-500.0} />,
    );
    const pnlElement = screen.getByText(/-500\.00/);
    expect(pnlElement).toHaveClass("text-[color:var(--trading-loss)]");
  });
});

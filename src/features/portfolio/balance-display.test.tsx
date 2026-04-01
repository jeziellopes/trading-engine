import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MOCK_PORTFOLIO_STATE } from "@/lib/mock-data";
import { BalanceDisplay } from "./balance-display";

describe("BalanceDisplay", () => {
  it("renders total balance", () => {
    render(
      <BalanceDisplay
        totalBalance={MOCK_PORTFOLIO_STATE.totalBalance}
        availableBalance={MOCK_PORTFOLIO_STATE.availableBalance}
        unrealizedPnL={MOCK_PORTFOLIO_STATE.unrealizedPnL}
      />,
    );
    expect(screen.getByText(/Total/)).toBeInTheDocument();
    expect(screen.getByText(/10,?423\.70/)).toBeInTheDocument();
  });

  it("renders available balance", () => {
    render(
      <BalanceDisplay
        totalBalance={MOCK_PORTFOLIO_STATE.totalBalance}
        availableBalance={MOCK_PORTFOLIO_STATE.availableBalance}
        unrealizedPnL={MOCK_PORTFOLIO_STATE.unrealizedPnL}
      />,
    );
    expect(screen.getByText(/Available/)).toBeInTheDocument();
    expect(screen.getByText(/4,?328\.50/)).toBeInTheDocument();
  });

  it("renders positive PnL with profit color", () => {
    render(
      <BalanceDisplay
        totalBalance={MOCK_PORTFOLIO_STATE.totalBalance}
        availableBalance={MOCK_PORTFOLIO_STATE.availableBalance}
        unrealizedPnL={MOCK_PORTFOLIO_STATE.unrealizedPnL}
      />,
    );
    const pnlElement = screen.getByText(/416\.10/);
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

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MOCK_PORTFOLIO_STATE } from "@/lib/mock-data";
import { BalanceDisplay } from "./balance-display";

const mockBalance = {
  total: MOCK_PORTFOLIO_STATE.totalBalance,
  available: MOCK_PORTFOLIO_STATE.availableBalance,
  unrealizedPnL: MOCK_PORTFOLIO_STATE.unrealizedPnL,
};

describe("BalanceDisplay", () => {
  it("renders total balance", () => {
    render(<BalanceDisplay balance={mockBalance} />);
    expect(screen.getByText(/Total/)).toBeInTheDocument();
    expect(screen.getByText(/10,?423\.70/)).toBeInTheDocument();
  });

  it("renders available balance", () => {
    render(<BalanceDisplay balance={mockBalance} />);
    expect(screen.getByText(/Available/)).toBeInTheDocument();
    expect(screen.getByText(/4,?328\.50/)).toBeInTheDocument();
  });

  it("renders positive PnL with profit color", () => {
    render(<BalanceDisplay balance={mockBalance} />);
    const pnlElement = screen.getByText(/416\.10/);
    expect(pnlElement).toHaveClass("text-trading-profit");
  });

  it("renders negative PnL with loss color", () => {
    render(<BalanceDisplay balance={{ total: 9000, available: 4000, unrealizedPnL: -250 }} />);
    const pnlElement = screen.getByText(/-\$250\.00/);
    expect(pnlElement).toHaveClass("text-trading-loss");
  });
});

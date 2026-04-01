import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MOCK_PORTFOLIO_STATE } from "@/lib/mock-data";
import { Portfolio } from "./portfolio";

describe("Portfolio", () => {
  it("renders portfolio title", () => {
    render(<Portfolio state={MOCK_PORTFOLIO_STATE} />);
    expect(screen.getByText(/Portfolio/)).toBeInTheDocument();
  });

  it("renders balance display", () => {
    render(<Portfolio state={MOCK_PORTFOLIO_STATE} />);
    expect(screen.getByText(/Total Balance/)).toBeInTheDocument();
    expect(screen.getByText(/10,?423\.70/)).toBeInTheDocument();
  });

  it("renders all positions", () => {
    render(<Portfolio state={MOCK_PORTFOLIO_STATE} />);
    expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
    expect(screen.getByText("ETHUSDT")).toBeInTheDocument();
  });

  it("renders empty message when no positions", () => {
    const emptyState = {
      ...MOCK_PORTFOLIO_STATE,
      positions: [],
    };
    render(<Portfolio state={emptyState} />);
    expect(screen.getByText(/No positions/)).toBeInTheDocument();
  });
});

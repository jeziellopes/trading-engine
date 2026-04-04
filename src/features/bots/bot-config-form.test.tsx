import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BotConfigForm } from "./bot-config-form";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("BotConfigForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders all required fields (name, strategy, symbol, interval)", () => {
    render(<BotConfigForm {...defaultProps} />);

    expect(screen.getByLabelText("Bot Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Strategy")).toBeInTheDocument();
    expect(screen.getByLabelText("Symbol")).toBeInTheDocument();
    expect(screen.getByLabelText("Interval")).toBeInTheDocument();
  });

  it("shows grid strategy parameters when grid is selected (default)", () => {
    render(<BotConfigForm {...defaultProps} />);

    expect(screen.getByLabelText("Lower Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Upper Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Grid Count")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount Per Grid")).toBeInTheDocument();
  });

  it("switches to DCA parameters when DCA strategy is selected", async () => {
    const user = userEvent.setup();
    render(<BotConfigForm {...defaultProps} />);

    await user.selectOptions(screen.getByLabelText("Strategy"), "dca");

    expect(screen.getByLabelText("Base Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Safety Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Safety Orders")).toBeInTheDocument();
    expect(screen.getByLabelText("Price Deviation (%)")).toBeInTheDocument();
    expect(screen.queryByLabelText("Lower Price")).not.toBeInTheDocument();
  });

  it("switches to RSI parameters when RSI strategy is selected", async () => {
    const user = userEvent.setup();
    render(<BotConfigForm {...defaultProps} />);

    await user.selectOptions(screen.getByLabelText("Strategy"), "rsi");

    expect(screen.getByLabelText("RSI Period")).toBeInTheDocument();
    expect(screen.getByLabelText("Oversold Level")).toBeInTheDocument();
    expect(screen.getByLabelText("Overbought Level")).toBeInTheDocument();
    expect(screen.getByLabelText("Position Size")).toBeInTheDocument();
    expect(screen.queryByLabelText("Lower Price")).not.toBeInTheDocument();
  });

  it("switches to MACD parameters when MACD strategy is selected", async () => {
    const user = userEvent.setup();
    render(<BotConfigForm {...defaultProps} />);

    await user.selectOptions(screen.getByLabelText("Strategy"), "macd");

    expect(screen.getByLabelText("Fast Period")).toBeInTheDocument();
    expect(screen.getByLabelText("Slow Period")).toBeInTheDocument();
    expect(screen.getByLabelText("Signal Period")).toBeInTheDocument();
    expect(screen.getByLabelText("Position Size")).toBeInTheDocument();
    expect(screen.queryByLabelText("Lower Price")).not.toBeInTheDocument();
  });

  it("shows risk control fields (max drawdown, stop-loss, take-profit)", () => {
    render(<BotConfigForm {...defaultProps} />);

    expect(screen.getByLabelText("Max Drawdown (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Stop Loss (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Take Profit (%)")).toBeInTheDocument();
  });

  it("calls onSubmit with form data when valid form is submitted", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<BotConfigForm {...defaultProps} onSubmit={onSubmit} />);

    // Fill grid strategy fields
    const lowerPrice = screen.getByLabelText("Lower Price");
    const upperPrice = screen.getByLabelText("Upper Price");
    const gridCount = screen.getByLabelText("Grid Count");
    const amount = screen.getByLabelText("Amount Per Grid");

    await user.type(lowerPrice, "30000");
    await user.type(upperPrice, "40000");
    await user.type(gridCount, "10");
    await user.type(amount, "0.001");

    // Submit
    await user.click(screen.getByRole("button", { name: /create bot/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedData = onSubmit.mock.calls[0]?.[0];
    expect(submittedData.strategy).toBe("grid");
    expect(submittedData.symbol).toBe("BTCUSDT");
    expect(submittedData.gridLowerPrice).toBe("30000");
    expect(submittedData.gridUpperPrice).toBe("40000");
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<BotConfigForm {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows validation errors for empty required fields on submit attempt", async () => {
    const user = userEvent.setup();
    render(<BotConfigForm {...defaultProps} />);

    // Clear the auto-generated name
    const nameInput = screen.getByLabelText("Bot Name");
    await user.clear(nameInput);

    // Submit without filling strategy params
    await user.click(screen.getByRole("button", { name: /create bot/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it("disables submit button when isLoading is true", () => {
    render(<BotConfigForm {...defaultProps} isLoading={true} />);

    const submitBtn = screen.getByRole("button", { name: /creating/i });
    expect(submitBtn).toBeDisabled();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderForm } from "./order-form";

const TEST_SYMBOL = "BTCUSDT";

describe("OrderForm", () => {
  const mockHandleSubmit = vi.fn();

  beforeEach(() => {
    mockHandleSubmit.mockReset();
  });

  it("renders side select (buy/sell)", () => {
    const { container } = render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    const text = container.textContent ?? "";
    expect(text).toContain("Buy");
    expect(text).toContain("Sell");
  });

  it("renders order type select", () => {
    const { container } = render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    const text = container.textContent ?? "";
    expect(text).toContain("Limit");
    expect(text).toContain("Market");
  });

  it("renders price input with label", () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
  });

  it("renders quantity input with label", () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  it("renders submit button defaulting to buy limit", () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    expect(screen.getByRole("button", { name: /buy limit/i })).toBeInTheDocument();
  });

  it("shows quantity validation error when submitting empty form", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /buy limit/i }));
    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it("shows limit price error when quantity is set but price is missing", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    await userEvent.type(screen.getByLabelText(/quantity/i), "0.5");
    await userEvent.click(screen.getByRole("button", { name: /buy limit/i }));
    await waitFor(() => {
      expect(screen.getByText(/limit price required/i)).toBeInTheDocument();
    });
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with valid limit order data", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    await userEvent.type(screen.getByLabelText(/quantity/i), "0.5");
    await userEvent.type(screen.getByLabelText(/price/i), "30000");
    await userEvent.click(screen.getByRole("button", { name: /buy limit/i }));
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: TEST_SYMBOL,
          side: "buy",
          type: "limit",
          quantity: "0.5",
          price: "30000",
        }),
      );
    });
  });

  it("does not require price for market orders", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    await userEvent.click(screen.getByRole("tab", { name: /market/i }));
    await userEvent.type(screen.getByLabelText(/quantity/i), "0.1");
    await userEvent.click(screen.getByRole("button", { name: /buy market/i }));
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: TEST_SYMBOL,
          side: "buy",
          type: "market",
          quantity: "0.1",
        }),
      );
    });
  });

  it("switches to sell side and updates submit button text", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /^sell$/i }));
    expect(screen.getByRole("button", { name: /sell limit/i })).toBeInTheDocument();
  });

  it("renders tablist for order type", () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    expect(screen.getByRole("tablist", { name: /order type/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /limit/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /market/i })).toBeInTheDocument();
  });

  it("hides price field in market tab", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    // Limit tab active by default — price visible
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    // Switch to market
    await userEvent.click(screen.getByRole("tab", { name: /market/i }));
    expect(screen.queryByLabelText(/price/i)).not.toBeInTheDocument();
  });

  it("switches tab with ArrowRight keyboard", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    const limitTab = screen.getByRole("tab", { name: /limit/i });
    limitTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /market/i })).toHaveAttribute("aria-selected", "true");
  });

  it("switches tab with ArrowLeft keyboard", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    // switch to market first
    await userEvent.click(screen.getByRole("tab", { name: /market/i }));
    const marketTab = screen.getByRole("tab", { name: /market/i });
    marketTab.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /limit/i })).toHaveAttribute("aria-selected", "true");
  });

  it("active tab is reflected in submit button label", async () => {
    render(<OrderForm symbol={TEST_SYMBOL} onSubmit={mockHandleSubmit} />);
    expect(screen.getByRole("button", { name: /buy limit/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /market/i }));
    expect(screen.getByRole("button", { name: /buy market/i })).toBeInTheDocument();
  });

});
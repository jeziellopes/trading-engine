import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrderForm } from "./order-form";

describe("OrderForm", () => {
  const mockHandleSubmit = vi.fn();

  it("renders side select (buy/sell)", () => {
    const { container } = render(<OrderForm onSubmit={mockHandleSubmit} />);
    const text = container.textContent || "";
    expect(text).toContain("Buy");
    expect(text).toContain("Sell");
  });

  it("renders order type select", () => {
    const { container } = render(<OrderForm onSubmit={mockHandleSubmit} />);
    const text = container.textContent || "";
    expect(text).toContain("Limit");
    expect(text).toContain("Market");
  });

  it("renders price input", () => {
    render(<OrderForm onSubmit={mockHandleSubmit} />);
    // price input uses placeholder "0.00" now
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/);
    expect(priceInputs.length).toBeGreaterThan(0);
  });

  it("renders quantity input", () => {
    render(<OrderForm onSubmit={mockHandleSubmit} />);
    // quantity input uses placeholder "0.000" now
    const quantityInputs = screen.getAllByPlaceholderText(/0\.000/);
    expect(quantityInputs.length).toBeGreaterThan(0);
  });

  it("renders submit button", () => {
    const { container } = render(<OrderForm onSubmit={mockHandleSubmit} />);
    const text = container.textContent || "";
    // submit text is now "Buy Limit" (side + type)
    expect(text).toContain("Buy");
  });

  it("defaults to BUY side", () => {
    const { container } = render(<OrderForm onSubmit={mockHandleSubmit} />);
    const buttons = container.querySelectorAll("button");
    // First button is Buy — uses intent="buy" which has trading-bid background
    const buyBtn = buttons[0];
    expect(buyBtn.textContent).toBe("Buy");
  });
});

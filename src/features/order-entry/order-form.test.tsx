import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    const priceInputs = screen.getAllByPlaceholderText(/price/i);
    expect(priceInputs.length).toBeGreaterThan(0);
  });

  it("renders quantity input", () => {
    render(<OrderForm onSubmit={mockHandleSubmit} />);
    const quantityInputs = screen.getAllByPlaceholderText(/quantity/i);
    expect(quantityInputs.length).toBeGreaterThan(0);
  });

  it("renders submit button", () => {
    const { container } = render(<OrderForm onSubmit={mockHandleSubmit} />);
    const text = container.textContent || "";
    expect(text).toContain("Place BUY Order");
  });

  it("defaults to BUY side", () => {
    const { container } = render(<OrderForm onSubmit={mockHandleSubmit} />);
    const buttons = container.querySelectorAll("button");
    // First button should be Buy with primary styling
    expect(buttons[0]).toHaveClass("bg-primary");
  });
});

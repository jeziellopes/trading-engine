import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("renders as an input element", () => {
    render(<Input aria-label="test input" />);
    expect(screen.getByLabelText("test input")).toBeInstanceOf(HTMLInputElement);
  });

  it("accepts type prop", () => {
    render(<Input type="email" aria-label="email" />);
    const input = screen.getByLabelText("email") as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("accepts placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("accepts value prop", () => {
    render(<Input value="test" readOnly />);
    const input = screen.getByDisplayValue("test") as HTMLInputElement;
    expect(input.value).toBe("test");
  });

  it("responds to input events", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("respects disabled prop", () => {
    render(<Input disabled aria-label="disabled input" />);
    const input = screen.getByLabelText("disabled input") as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Input ref={ref} aria-label="ref input" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies default styling classes", () => {
    render(<Input aria-label="styled input" />);
    const input = screen.getByLabelText("styled input");
    expect(input).toHaveClass("rounded-md", "border", "bg-input");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea placeholder="Notes..." />);
    expect(screen.getByPlaceholderText("Notes...")).toBeInTheDocument();
  });

  it("is disabled when disabled prop passed", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Textarea className="h-24" />);
    expect(screen.getByRole("textbox").className).toContain("h-24");
  });
});

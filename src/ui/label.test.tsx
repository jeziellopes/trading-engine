import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("renders children", () => {
    render(<Label>Strategy</Label>);
    expect(screen.getByText("Strategy")).toBeInTheDocument();
  });

  it("forwards htmlFor attribute", () => {
    render(<Label htmlFor="bot-strategy">Strategy</Label>);
    expect(screen.getByText("Strategy")).toHaveAttribute("for", "bot-strategy");
  });

  it("applies default muted-foreground classes", () => {
    render(<Label>Label</Label>);
    expect(screen.getByText("Label").className).toContain("text-muted-foreground");
  });

  it("accepts custom className", () => {
    render(<Label className="text-primary">Custom</Label>);
    expect(screen.getByText("Custom").className).toContain("text-primary");
  });
});

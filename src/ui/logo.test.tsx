import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders an svg with aria-label", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: "Logo" })).toBeInTheDocument();
  });

  it("applies default text-primary variant class", () => {
    render(<Logo />);
    expect(screen.getByRole("img").getAttribute("class")).toContain("text-primary");
  });

  it("applies subtle variant class", () => {
    render(<Logo variant="subtle" />);
    expect(screen.getByRole("img").getAttribute("class")).toContain("text-muted-foreground");
  });

  it("forwards custom className", () => {
    render(<Logo className="w-8 h-8" />);
    expect(screen.getByRole("img").getAttribute("class")).toContain("w-8");
  });
});

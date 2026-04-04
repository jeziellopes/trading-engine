import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select } from "./select";

describe("Select", () => {
  it("renders with options", () => {
    render(
      <Select aria-label="strategy">
        <option value="grid">Grid</option>
        <option value="dca">DCA</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("is disabled when disabled prop passed", () => {
    render(<Select aria-label="strategy" disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Select aria-label="strategy" className="w-32" />);
    expect(screen.getByRole("combobox").className).toContain("w-32");
  });
});

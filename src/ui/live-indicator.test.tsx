import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LiveIndicator } from "./live-indicator";

describe("LiveIndicator", () => {
  it("renders connected state", () => {
    render(<LiveIndicator status="connected" />);
    expect(screen.getByText(/live/i)).toBeTruthy();
  });

  it("renders reconnecting state", () => {
    render(<LiveIndicator status="reconnecting" />);
    expect(screen.getByText(/reconnecting/i)).toBeTruthy();
  });

  it("renders disconnected state", () => {
    render(<LiveIndicator status="disconnected" />);
    expect(screen.getByText("Offline")).toBeTruthy();
  });
});

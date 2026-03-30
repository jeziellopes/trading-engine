import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionBanner } from "./connection-banner";

describe("ConnectionBanner", () => {
  it("does not render when connected", () => {
    const { container } = render(<ConnectionBanner status="connected" />);
    expect(container.firstChild).not.toBeInTheDocument();
  });

  it("renders reconnecting state with message", () => {
    render(<ConnectionBanner status="reconnecting" />);
    expect(screen.getByText(/Reconnecting.../)).toBeInTheDocument();
  });

  it("applies reconnecting styling", () => {
    const { container } = render(<ConnectionBanner status="reconnecting" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass("border-b", "text-xs", "font-mono", "flex", "items-center", "gap-2");
  });

  it("renders disconnected state with message", () => {
    render(<ConnectionBanner status="disconnected" />);
    expect(screen.getByText(/Disconnected/)).toBeInTheDocument();
  });

  it("includes pulsing dot indicator when reconnecting", () => {
    const { container } = render(<ConnectionBanner status="reconnecting" />);
    const dot = container.querySelector("[class*='animate-pulse']");
    expect(dot).toBeInTheDocument();
  });
});

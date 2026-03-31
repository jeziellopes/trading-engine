import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();
let mockPathname = "/symbol/BTCUSDT";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: mockPathname } }),
}));

import { SymbolSelector } from "./symbol-selector";

describe("SymbolSelector", () => {
  it("renders button with current symbol from URL", () => {
    render(<SymbolSelector />);
    expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
  });

  it("hides dropdown initially", () => {
    render(<SymbolSelector />);
    expect(screen.queryByPlaceholderText("Search pair...")).not.toBeInTheDocument();
  });

  it("shows dropdown when button is clicked", async () => {
    const user = userEvent.setup();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    expect(screen.getByPlaceholderText("Search pair...")).toBeInTheDocument();
  });

  it("shows category headers when dropdown is open with no search", async () => {
    const user = userEvent.setup();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    expect(screen.getByText("USDT pairs")).toBeInTheDocument();
    expect(screen.getByText("BTC pairs")).toBeInTheDocument();
    expect(screen.getByText("ETH pairs")).toBeInTheDocument();
  });

  it("filters symbols by search text (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    await user.type(screen.getByPlaceholderText("Search pair..."), "sol");
    // SOL symbols should appear (multiple: SOLUSDT, SOLBTC, SOLETH)
    const solElements = screen.getAllByText("SOL");
    expect(solElements.length).toBeGreaterThanOrEqual(1);
    // BNB-only symbols should not appear
    expect(screen.queryByText("ADA")).not.toBeInTheDocument();
  });

  it('shows "No results" when search matches nothing', async () => {
    const user = userEvent.setup();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    await user.type(screen.getByPlaceholderText("Search pair..."), "zzzzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("calls navigate on symbol selection", async () => {
    const user = userEvent.setup();
    mockNavigate.mockClear();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    // Click on ETHUSDT row — find the "ETH" text within the list (not the category header)
    const ethButtons = screen.getAllByRole("button", { name: /ETH/ });
    // The first button is the selector trigger, find the list buttons
    const listButton = ethButtons.find(
      (btn) => btn.textContent?.includes("/USDT"),
    );
    expect(listButton).toBeDefined();
    await user.click(listButton!);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ symbol: "ETHUSDT" }),
      }),
    );
  });

  it("closes dropdown after symbol selection", async () => {
    const user = userEvent.setup();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    expect(screen.getByPlaceholderText("Search pair...")).toBeInTheDocument();
    const ethButtons = screen.getAllByRole("button", { name: /ETH/ });
    const listButton = ethButtons.find(
      (btn) => btn.textContent?.includes("/USDT"),
    );
    await user.click(listButton!);
    expect(screen.queryByPlaceholderText("Search pair...")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape key", async () => {
    const user = userEvent.setup();
    render(<SymbolSelector />);
    await user.click(screen.getByRole("button", { name: /BTCUSDT/ }));
    expect(screen.getByPlaceholderText("Search pair...")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText("Search pair...")).not.toBeInTheDocument();
  });
});

describe("SymbolSelector with no symbol in URL", () => {
  it('renders with "SELECT PAIR" when no symbol in URL', () => {
    mockPathname = "/other-page";
    render(<SymbolSelector />);
    expect(screen.getByText("SELECT PAIR")).toBeInTheDocument();
    mockPathname = "/symbol/BTCUSDT";
  });
});

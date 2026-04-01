import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Panel } from "./panel";

describe("Panel", () => {
  it("renders title and children", () => {
    render(
      <Panel title="Order Book">
        <span>content</span>
      </Panel>,
    );
    expect(screen.getByText("Order Book")).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders headerExtra slot", () => {
    render(
      <Panel title="Chart" headerExtra={<button type="button">1h</button>}>
        <div />
      </Panel>,
    );
    expect(screen.getByRole("button", { name: "1h" })).toBeTruthy();
  });

  it("applies noScroll class when noScroll is true", () => {
    const { container } = render(
      <Panel title="Chart" noScroll>
        <div />
      </Panel>,
    );
    const inner = container.querySelector(".overflow-hidden.flex.flex-col");
    expect(inner).toBeTruthy();
  });

  it("applies overflow-y-auto by default", () => {
    const { container } = render(
      <Panel title="Default">
        <div />
      </Panel>,
    );
    const inner = container.querySelector(".overflow-y-auto");
    expect(inner).toBeTruthy();
  });
});

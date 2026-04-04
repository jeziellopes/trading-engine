import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Panel } from "./panel";

describe("Panel", () => {
  it("renders title and children", () => {
    render(
      <Panel title="Order Book">
        <Panel.Content>
          <span>content</span>
        </Panel.Content>
      </Panel>,
    );
    expect(screen.getByText("Order Book")).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("Panel.Header injects extra slot into header", () => {
    render(
      <Panel title="Chart">
        <Panel.Header extra={<button type="button">1h</button>} />
        <Panel.Content>
          <div />
        </Panel.Content>
      </Panel>,
    );
    expect(screen.getByRole("button", { name: "1h" })).toBeTruthy();
  });

  it("Panel.Content with noScroll applies overflow-hidden", () => {
    const { container } = render(
      <Panel title="Chart">
        <Panel.Content noScroll>
          <div />
        </Panel.Content>
      </Panel>,
    );
    const content = container.querySelector(".overflow-hidden.flex.flex-col");
    expect(content).toBeTruthy();
  });

  it("Panel.Content without noScroll applies overflow-y-auto", () => {
    const { container } = render(
      <Panel title="Default">
        <Panel.Content>
          <div />
        </Panel.Content>
      </Panel>,
    );
    const content = container.querySelector(".overflow-y-auto");
    expect(content).toBeTruthy();
  });

  it("Panel.Header renders no visible element itself", () => {
    const { container } = render(
      <Panel title="Test">
        <Panel.Header extra={<span>extra</span>} />
        <Panel.Content>body</Panel.Content>
      </Panel>,
    );
    // Panel.Header itself renders null; extra appears in the header bar
    expect(screen.getByText("extra")).toBeTruthy();
    // No duplicate header divs
    const headers = container.querySelectorAll(".border-b");
    expect(headers).toHaveLength(1);
  });
});

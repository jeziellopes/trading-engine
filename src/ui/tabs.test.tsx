import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Tab, TabList, TabPanel } from "./tabs";

function Fixture({ defaultValue = "a" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <>
      <TabList value={value} onValueChange={setValue} aria-label="Test tabs">
        <Tab value="a">Tab A</Tab>
        <Tab value="b">Tab B</Tab>
        <Tab value="c">Tab C</Tab>
      </TabList>
      <TabPanel value="a" activeValue={value}>
        Panel A
      </TabPanel>
      <TabPanel value="b" activeValue={value}>
        Panel B
      </TabPanel>
      <TabPanel value="c" activeValue={value}>
        Panel C
      </TabPanel>
    </>
  );
}

describe("TabList / Tab / TabPanel", () => {
  it("renders tablist with correct role", () => {
    render(<Fixture />);
    expect(screen.getByRole("tablist", { name: /test tabs/i })).toBeInTheDocument();
  });

  it("renders all tabs", () => {
    render(<Fixture />);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("active tab has aria-selected=true", () => {
    render(<Fixture defaultValue="b" />);
    expect(screen.getByRole("tab", { name: /tab b/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /tab a/i })).toHaveAttribute("aria-selected", "false");
  });

  it("active tab has tabIndex=0, inactive tabs have tabIndex=-1", () => {
    render(<Fixture defaultValue="a" />);
    expect(screen.getByRole("tab", { name: /tab a/i })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: /tab b/i })).toHaveAttribute("tabindex", "-1");
  });

  it("clicking a tab activates it and shows its panel", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByRole("tab", { name: /tab b/i }));
    expect(screen.getByRole("tab", { name: /tab b/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
  });

  it("only the active panel is rendered", () => {
    render(<Fixture defaultValue="a" />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel A");
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
    expect(screen.queryByText("Panel C")).not.toBeInTheDocument();
  });

  it("ArrowRight moves focus to next tab", async () => {
    render(<Fixture defaultValue="a" />);
    screen.getByRole("tab", { name: /tab a/i }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /tab b/i })).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowLeft moves focus to previous tab", async () => {
    render(<Fixture defaultValue="b" />);
    screen.getByRole("tab", { name: /tab b/i }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /tab a/i })).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowRight wraps from last to first tab", async () => {
    render(<Fixture defaultValue="c" />);
    screen.getByRole("tab", { name: /tab c/i }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /tab a/i })).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowLeft wraps from first to last tab", async () => {
    render(<Fixture defaultValue="a" />);
    screen.getByRole("tab", { name: /tab a/i }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /tab c/i })).toHaveAttribute("aria-selected", "true");
  });

  it("throws if Tab is used outside TabList", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow("<Tab> must be inside <TabList>");
    spy.mockRestore();
  });
});

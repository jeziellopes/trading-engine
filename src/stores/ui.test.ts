import { afterEach, describe, expect, it } from "vitest";
import { useUIStore } from "./ui";

afterEach(() => {
  useUIStore.setState({ activeTab: "book", levels: 20 });
});

describe("useUIStore", () => {
  it("has correct initial state", () => {
    const state = useUIStore.getState();
    expect(state.activeTab).toBe("book");
    expect(state.levels).toBe(20);
  });

  it("setActiveTab updates activeTab", () => {
    useUIStore.getState().setActiveTab("depth");
    expect(useUIStore.getState().activeTab).toBe("depth");
  });

  it("setActiveTab accepts all valid tabs", () => {
    const tabs = ["book", "trades", "depth"] as const;
    for (const tab of tabs) {
      useUIStore.getState().setActiveTab(tab);
      expect(useUIStore.getState().activeTab).toBe(tab);
    }
  });

  it("setLevels updates levels", () => {
    useUIStore.getState().setLevels(50);
    expect(useUIStore.getState().levels).toBe(50);
  });

  it("syncFromSearch updates both activeTab and levels", () => {
    useUIStore.getState().syncFromSearch("trades", 10);
    const state = useUIStore.getState();
    expect(state.activeTab).toBe("trades");
    expect(state.levels).toBe(10);
  });

  it("syncFromSearch overwrites previous state", () => {
    useUIStore.getState().setActiveTab("depth");
    useUIStore.getState().setLevels(50);
    useUIStore.getState().syncFromSearch("book", 20);
    const state = useUIStore.getState();
    expect(state.activeTab).toBe("book");
    expect(state.levels).toBe(20);
  });
});

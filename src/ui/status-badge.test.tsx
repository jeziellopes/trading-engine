import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
const statuses = ["running", "paused", "stopped", "filled", "open", "cancelled", "connected", "reconnecting", "disconnected"] as const;

for (const status of statuses) {
it(`renders ${status} status`, () => {
render(<StatusBadge status={status} />);
expect(screen.getByText(status)).toBeTruthy();
});
}
});

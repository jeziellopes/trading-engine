import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
it("renders with animate-pulse class", () => {
const { container } = render(<Skeleton />);
expect(container.firstChild).toHaveProperty("className");
const cls = (container.firstChild as HTMLElement).className;
expect(cls).toContain("animate-pulse");
});

it("renders block variant", () => {
const { container } = render(<Skeleton variant="block" />);
const el = container.firstChild as HTMLElement;
expect(el.className).toContain("animate-pulse");
});

it("applies custom className", () => {
const { container } = render(<Skeleton className="w-32 h-8" />);
const el = container.firstChild as HTMLElement;
expect(el.className).toContain("w-32");
});
});

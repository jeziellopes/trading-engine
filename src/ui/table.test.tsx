import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

describe("Table compounds", () => {
function SampleTable() {
return (
<Table>
<TableHeader>
<tr>
<TableHead>Symbol</TableHead>
<TableHead>Price</TableHead>
</tr>
</TableHeader>
<TableBody>
<TableRow>
<TableCell>BTCUSDT</TableCell>
<TableCell>67,843</TableCell>
</TableRow>
</TableBody>
</Table>
);
}

it("renders header cells", () => {
render(<SampleTable />);
expect(screen.getByText("Symbol")).toBeTruthy();
expect(screen.getByText("Price")).toBeTruthy();
});

it("renders body cells", () => {
render(<SampleTable />);
expect(screen.getByText("BTCUSDT")).toBeTruthy();
expect(screen.getByText("67,843")).toBeTruthy();
});

it("renders a table element", () => {
const { container } = render(<SampleTable />);
expect(container.querySelector("table")).toBeTruthy();
});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

describe("Card", () => {
  it("renders as a div with card styling", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card).toHaveClass(
      "flex",
      "flex-col",
      "gap-3",
      "p-4",
      "rounded-md",
      "border",
      "bg-ds-gray-100",
    );
  });

  it("renders CardHeader", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>,
    );
    const header = screen.getByText("Header");
    expect(header).toHaveClass("flex", "items-start", "justify-between");
  });

  it("renders CardContent", () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>,
    );
    const content = screen.getByText("Main content");
    expect(content).toHaveClass("flex-1");
  });

  it("renders CardFooter", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    const footer = screen.getByText("Footer");
    expect(footer).toHaveClass("border-t", "border-border", "pt-1", "flex", "justify-between");
  });

  it("accepts className on Card", () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText("Content");
    expect(card).toHaveClass("custom-class");
  });
});

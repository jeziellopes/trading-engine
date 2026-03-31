import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./error-boundary";

// Suppress React's console.error noise during error boundary tests
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Thrower({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error("Test error");
  return <div>Child content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("shows default fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls onError callback when child throws", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it("renders custom fallback prop when provided", () => {
    const customFallback = (error: Error) => <div>Custom: {error.message}</div>;
    render(
      <ErrorBoundary fallback={customFallback}>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom: Test error")).toBeInTheDocument();
  });

  it("reset button clears error state and re-renders children", async () => {
    const user = userEvent.setup();

    // Use a ref-like object so the test controls when to stop throwing.
    // A plain counter breaks in React 19 because concurrent mode retries the
    // failed render synchronously — incrementing the counter a second time
    // before the error boundary can catch. A boolean flag stays `true` on
    // every retry until the test explicitly flips it.
    const throwState = { shouldThrow: true };

    function ControlledChild() {
      if (throwState.shouldThrow) throw new Error("Test error");
      return <div>Recovered content</div>;
    }

    render(
      <ErrorBoundary>
        <ControlledChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Allow the child to render successfully on the next attempt
    throwState.shouldThrow = false;

    const resetBtn = screen.getByRole("button", { name: /try again/i });
    await user.click(resetBtn);

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
  });
});

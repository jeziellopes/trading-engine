import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/symbol/$symbol")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/symbol/$symbol"!</div>;
}

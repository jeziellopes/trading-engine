import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/design-system")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/design-system"!</div>;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";
import App from "./App.tsx";

// biome-ignore lint/style/noNonNullAssertion: root element must exist at runtime
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

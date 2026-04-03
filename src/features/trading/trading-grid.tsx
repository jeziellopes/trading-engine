import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout/legacy";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import type { ComponentProps } from "react";

export type { Layout, LayoutItem, ResponsiveLayouts };

// Matches the internal EventCallback signature from react-grid-layout
export type RGLEventCallback = (
  layout: Layout,
  oldItem: LayoutItem | null,
  newItem: LayoutItem | null,
  placeholder: LayoutItem | null,
  event: Event,
  element: HTMLElement | null,
) => void;

const ResponsiveGridLayout = WidthProvider(Responsive);

type TradingGridProps = ComponentProps<typeof ResponsiveGridLayout>;

export default function TradingGrid(props: TradingGridProps) {
  return <ResponsiveGridLayout {...props} />;
}

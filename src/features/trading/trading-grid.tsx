import type { Layout, ResponsiveLayouts } from "react-grid-layout/legacy";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import type { ComponentProps } from "react";

export type { Layout, ResponsiveLayouts };

const ResponsiveGridLayout = WidthProvider(Responsive);

type TradingGridProps = ComponentProps<typeof ResponsiveGridLayout>;

export default function TradingGrid(props: TradingGridProps) {
  return <ResponsiveGridLayout {...props} />;
}

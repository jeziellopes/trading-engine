import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva("bg-muted animate-pulse rounded", {
  variants: {
    variant: {
      default: "",
      text: "h-4",
      heading: "h-6",
      avatar: "rounded-full",
      block: "rounded-md",
    },
  },
  defaultVariants: { variant: "default" },
});

export type SkeletonProps = VariantProps<typeof skeletonVariants> & {
  className?: string;
  width?: string;
  height?: string;
};

export function Skeleton({ variant, className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

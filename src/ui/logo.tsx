import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const logoVariants = cva("inline-flex items-center rounded font-mono transition-colors", {
  variants: {
    variant: {
      default: "text-primary",
      subtle: "text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface LogoProps extends React.SVGAttributes<SVGSVGElement>, VariantProps<typeof logoVariants> {}

export function Logo({ variant, className, ...props }: LogoProps) {
  return (
    <svg
      className={cn(logoVariants({ variant }), className)}
      {...props}
      width="650"
      height="621"
      viewBox="0 0 650 621"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo"
    >
      <rect x="283.5" y="132" width="83" height="357" fill="currentColor" />
      <rect x="379.5" y="85" width="83" height="353" fill="currentColor" />
      <rect x="187.5" y="179" width="83" height="357" fill="currentColor" />
    </svg>
  );
}

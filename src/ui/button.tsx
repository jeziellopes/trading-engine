import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        buy: "bg-[color:var(--trading-bid)] text-foreground font-semibold hover:opacity-90",
        sell: "bg-[color:var(--trading-ask)] text-foreground font-semibold hover:opacity-90",
        ghost: "bg-transparent text-foreground hover:bg-muted",
      },
      size: {
        xs: "px-1.5 py-0.5 text-xs rounded",
        sm: "px-2 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({ intent, size, className, ref, ...props }: ButtonProps) {
  return (
    <button ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
  );
}

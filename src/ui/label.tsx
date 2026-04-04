import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  ref?: React.Ref<HTMLLabelElement>;
}

export function Label({ className, ref, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor provided by consumer via props
    <label
      ref={ref}
      className={cn("block text-xs text-muted-foreground mb-1", className)}
      {...props}
    />
  );
}

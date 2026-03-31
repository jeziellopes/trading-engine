import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

const orderSchema = z
  .object({
    side: z.enum(["buy", "sell"]),
    type: z.enum(["market", "limit"]),
    quantity: z
      .string()
      .min(1, "Quantity is required")
      .refine((v) => Number(v) > 0, { message: "Must be positive" }),
    price: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "limit" && (!data.price || Number(data.price) <= 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Limit price required",
        path: ["price"],
      });
    }
  });

export type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, isLoading = false }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { side: "buy", type: "limit", quantity: "", price: "" },
  });

  const side = watch("side");
  const type = watch("type");
  const busy = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2.5">
      {/* Side Selection */}
      <div className="flex gap-1.5">
        <Button
          type="button"
          intent={side === "buy" ? "buy" : "ghost"}
          size="sm"
          onClick={() => setValue("side", "buy")}
          className="flex-1"
        >
          Buy
        </Button>
        <Button
          type="button"
          intent={side === "sell" ? "sell" : "ghost"}
          size="sm"
          onClick={() => setValue("side", "sell")}
          className="flex-1"
        >
          Sell
        </Button>
      </div>

      {/* Order Type Selection */}
      <div className="flex gap-1">
        <Button
          type="button"
          intent={type === "limit" ? "primary" : "ghost"}
          size="xs"
          onClick={() => setValue("type", "limit")}
          className="flex-1"
        >
          Limit
        </Button>
        <Button
          type="button"
          intent={type === "market" ? "primary" : "ghost"}
          size="xs"
          onClick={() => setValue("type", "market")}
          className="flex-1"
        >
          Market
        </Button>
      </div>

      {/* Price Input — always visible; disabled for market orders */}
      <div>
        <label htmlFor="order-price" className="text-xs text-muted-foreground block mb-1">
          Price
          {type === "market" && (
            <span className="ml-1.5 text-[10px] text-muted-foreground opacity-60">market</span>
          )}
        </label>
        <Input
          id="order-price"
          type="number"
          placeholder={type === "market" ? "Market price" : "0.00"}
          {...register("price")}
          disabled={busy || type === "market"}
          step="0.01"
          size="sm"
          aria-invalid={errors.price ? "true" : "false"}
          aria-describedby={errors.price ? "order-price-error" : undefined}
        />
        {errors.price && (
          <p
            id="order-price-error"
            role="alert"
            className="text-xs mt-1"
            style={{ color: "var(--trading-loss)" }}
          >
            {errors.price.message}
          </p>
        )}
      </div>

      {/* Quantity Input */}
      <div>
        <label htmlFor="order-quantity" className="text-xs text-muted-foreground block mb-1">
          Quantity
        </label>
        <Input
          id="order-quantity"
          type="number"
          placeholder="0.000"
          {...register("quantity")}
          disabled={busy}
          step="0.001"
          size="sm"
          aria-invalid={errors.quantity ? "true" : "false"}
          aria-describedby={errors.quantity ? "order-quantity-error" : undefined}
        />
        {errors.quantity && (
          <p
            id="order-quantity-error"
            role="alert"
            className="text-xs mt-1"
            style={{ color: "var(--trading-loss)" }}
          >
            {errors.quantity.message}
          </p>
        )}
      </div>

      {/* Quick-fill shortcuts */}
      <div className="flex gap-1">
        {(["25%", "50%", "75%", "100%"] as const).map((pct) => (
          <Button key={pct} type="button" intent="ghost" size="xs" className="flex-1">
            {pct}
          </Button>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        intent={side === "buy" ? "buy" : "sell"}
        size="sm"
        className="w-full"
        disabled={busy}
      >
        {busy
          ? "Placing..."
          : `${side === "buy" ? "Buy" : "Sell"} ${type === "limit" ? "Limit" : "Market"}`}
      </Button>
    </form>
  );
}

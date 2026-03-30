import { useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export interface OrderFormData {
  side: "buy" | "sell";
  type: "limit" | "market";
  price?: string | undefined;
  quantity: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, isLoading = false }: OrderFormProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      side,
      type,
      price: type === "limit" ? price : undefined,
      quantity,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {/* Side Selection */}
      <div className="flex gap-1.5">
        <Button
          type="button"
          intent={side === "buy" ? "buy" : "ghost"}
          size="sm"
          onClick={() => setSide("buy")}
          className="flex-1"
        >
          Buy
        </Button>
        <Button
          type="button"
          intent={side === "sell" ? "sell" : "ghost"}
          size="sm"
          onClick={() => setSide("sell")}
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
          onClick={() => setType("limit")}
          className="flex-1"
        >
          Limit
        </Button>
        <Button
          type="button"
          intent={type === "market" ? "primary" : "ghost"}
          size="xs"
          onClick={() => setType("market")}
          className="flex-1"
        >
          Market
        </Button>
      </div>

      {/* Price Input — always visible; disabled for market orders */}
      <div>
        <p className="text-xs text-muted-foreground block mb-1">
          Price
          {type === "market" && (
            <span className="ml-1.5 text-[10px] text-muted-foreground opacity-60">market</span>
          )}
        </p>
        <Input
          type="number"
          placeholder={type === "market" ? "Market price" : "0.00"}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isLoading || type === "market"}
          step="0.01"
          size="sm"
        />
      </div>

      {/* Quantity Input */}
      <div>
        <p className="text-xs text-muted-foreground block mb-1">Quantity</p>
        <Input
          type="number"
          placeholder="0.000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={isLoading}
          step="0.001"
          size="sm"
        />
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
        disabled={isLoading || !quantity || (type === "limit" && !price)}
      >
        {isLoading
          ? "Placing..."
          : `${side === "buy" ? "Buy" : "Sell"} ${type === "limit" ? "Limit" : "Market"}`}
      </Button>
    </form>
  );
}

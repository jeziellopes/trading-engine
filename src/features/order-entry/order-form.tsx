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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Side Selection */}
      <div className="flex gap-2">
        <Button
          type="button"
          intent={side === "buy" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setSide("buy")}
          className="flex-1"
        >
          Buy
        </Button>
        <Button
          type="button"
          intent={side === "sell" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setSide("sell")}
          className="flex-1"
        >
          Sell
        </Button>
      </div>

      {/* Order Type Selection */}
      <div className="flex gap-2">
        <Button
          type="button"
          intent={type === "limit" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setType("limit")}
          className="flex-1"
        >
          Limit
        </Button>
        <Button
          type="button"
          intent={type === "market" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setType("market")}
          className="flex-1"
        >
          Market
        </Button>
      </div>

      {/* Price Input (only for limit orders) */}
      {type === "limit" && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Price</label>
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isLoading}
            step="0.01"
          />
        </div>
      )}

      {/* Quantity Input */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Quantity</label>
        <Input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={isLoading}
          step="0.001"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        intent="primary"
        size="md"
        className="w-full"
        disabled={isLoading || !quantity || (type === "limit" && !price)}
      >
        {isLoading ? "Placing..." : `Place ${side.toUpperCase()} Order`}
      </Button>
    </form>
  );
}

import { useState } from "react";
import { OrderBook } from "@/features/order-book/order-book";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { Portfolio } from "@/features/portfolio/portfolio";

interface TradingLayoutProps {
  symbol: string;
}

// Mock data for demo
const mockOrderBookState = {
  bids: [
    { price: 42502.0, quantity: 1.5, total: 63753.0, percent: 55 },
    { price: 42501.0, quantity: 2.2, total: 93502.2, percent: 45 },
    { price: 42500.0, quantity: 3.0, total: 127500.0, percent: 30 },
  ],
  asks: [
    { price: 42504.0, quantity: 1.0, total: 42504.0, percent: 40 },
    { price: 42505.0, quantity: 2.5, total: 106262.5, percent: 60 },
    { price: 42506.0, quantity: 1.8, total: 76510.8, percent: 35 },
  ],
  bestBid: 42502.0,
  bestAsk: 42504.0,
  lastPrice: 42503.0,
  spreadAmount: 2.0,
  spreadPercent: 0.0047,
  connectionStatus: "connected" as const,
  lastPriceTick: "up" as const,
};

const mockPortfolioState = {
  totalBalance: 10000.0,
  availableBalance: 5000.0,
  unrealizedPnL: 1500.0,
  positions: [
    {
      symbol: "BTCUSDT",
      quantity: 0.5,
      entryPrice: 42000.0,
      markPrice: 42500.0,
      unrealizedPnL: 250.0,
      unrealizedPnLPercent: 0.595,
    },
    {
      symbol: "ETHUSDT",
      quantity: 5.0,
      entryPrice: 2400.0,
      markPrice: 2410.0,
      unrealizedPnL: 50.0,
      unrealizedPnLPercent: 0.208,
    },
  ],
};

export function TradingLayout({ symbol }: TradingLayoutProps) {
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  const handleOrderSubmit = async (data: OrderFormData) => {
    setOrderSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Order submitted:", data);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-cypher font-bold mb-6">{symbol}</h1>

      <div className="grid grid-cols-[300px_1fr_300px] gap-4 h-[calc(100vh-200px)]">
        {/* Left: Order Book */}
        <div className="bg-card rounded-md border border-border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium font-cypher">Order Book</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <OrderBook state={mockOrderBookState} />
          </div>
        </div>

        {/* Center: Chart (placeholder) */}
        <div className="bg-card rounded-md border border-border flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-cypher">Price Chart</h2>
            <p className="text-muted-foreground">Lightweight Charts integration will go here</p>
            <div className="flex items-center justify-center h-64 bg-muted/20 rounded border border-border">
              <span className="text-muted-foreground">Chart Placeholder</span>
            </div>
          </div>
        </div>

        {/* Right: Portfolio & Order Entry */}
        <div className="flex flex-col gap-4">
          {/* Portfolio Section */}
          <div className="bg-card rounded-md border border-border overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-3 border-b border-border overflow-auto">
              <Portfolio state={mockPortfolioState} />
            </div>
          </div>

          {/* Order Entry Section */}
          <div className="bg-card rounded-md border border-border p-4">
            <h2 className="text-sm font-medium font-cypher mb-4">Place Order</h2>
            <OrderForm onSubmit={handleOrderSubmit} isLoading={orderSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { OrderBookRow, type PriceLevel } from "./order-book-row";

interface TableProps {
  levels: PriceLevel[];
}

export function BidTable({ levels }: TableProps) {
  // Bids sorted highest price first
  const sortedLevels = [...levels].sort((a, b) => b.price - a.price);

  return (
    <div className="space-y-px">
      {sortedLevels.map((level) => (
        <OrderBookRow key={`bid-${level.price}`} level={level} side="bid" />
      ))}
    </div>
  );
}

export function AskTable({ levels }: TableProps) {
  // Asks sorted lowest price first
  const sortedLevels = [...levels].sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-px">
      {sortedLevels.map((level) => (
        <OrderBookRow key={`ask-${level.price}`} level={level} side="ask" />
      ))}
    </div>
  );
}

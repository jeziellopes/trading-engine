/** Exchange-agnostic snapshot — maps to Binance lastUpdateId, or backend sequence. */
export interface NormalizedSnapshot {
  bids: [string, string][];
  asks: [string, string][];
  sequenceId: number;
}

/** Incremental depth delta. firstSequenceId / lastSequenceId map to Binance U / u. */
export interface NormalizedDepthUpdate {
  bids: [string, string][];
  asks: [string, string][];
  firstSequenceId: number;
  lastSequenceId: number;
}

export interface NormalizedTrade {
  id: string;
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}

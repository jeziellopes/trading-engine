export interface SymbolInfo {
  symbol: string;
  base: string;
  quote: string;
  category: "USDT" | "BTC" | "ETH" | "BNB";
}

export const SYMBOLS: SymbolInfo[] = [
  // USDT pairs
  { symbol: "BTCUSDT", base: "BTC", quote: "USDT", category: "USDT" },
  { symbol: "ETHUSDT", base: "ETH", quote: "USDT", category: "USDT" },
  { symbol: "BNBUSDT", base: "BNB", quote: "USDT", category: "USDT" },
  { symbol: "SOLUSDT", base: "SOL", quote: "USDT", category: "USDT" },
  { symbol: "XRPUSDT", base: "XRP", quote: "USDT", category: "USDT" },
  { symbol: "DOGEUSDT", base: "DOGE", quote: "USDT", category: "USDT" },
  { symbol: "ADAUSDT", base: "ADA", quote: "USDT", category: "USDT" },
  { symbol: "AVAXUSDT", base: "AVAX", quote: "USDT", category: "USDT" },
  { symbol: "DOTUSDT", base: "DOT", quote: "USDT", category: "USDT" },
  { symbol: "MATICUSDT", base: "MATIC", quote: "USDT", category: "USDT" },
  { symbol: "LINKUSDT", base: "LINK", quote: "USDT", category: "USDT" },
  { symbol: "UNIUSDT", base: "UNI", quote: "USDT", category: "USDT" },
  // BTC pairs
  { symbol: "ETHBTC", base: "ETH", quote: "BTC", category: "BTC" },
  { symbol: "BNBBTC", base: "BNB", quote: "BTC", category: "BTC" },
  { symbol: "SOLBTC", base: "SOL", quote: "BTC", category: "BTC" },
  { symbol: "XRPBTC", base: "XRP", quote: "BTC", category: "BTC" },
  // ETH pairs
  { symbol: "BNBETH", base: "BNB", quote: "ETH", category: "ETH" },
  { symbol: "SOLETH", base: "SOL", quote: "ETH", category: "ETH" },
];

export const DEFAULT_SYMBOL = "BTCUSDT";

export function findSymbol(symbol: string): SymbolInfo | undefined {
  return SYMBOLS.find((s) => s.symbol === symbol);
}

export const SYMBOL_CATEGORIES = ["USDT", "BTC", "ETH", "BNB"] as const;

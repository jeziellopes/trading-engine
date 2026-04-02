import type { SymbolInfo } from "@/lib/symbols";
import { SYMBOLS } from "@/lib/symbols";

export function useSymbolSearch(query: string): SymbolInfo[] | null {
  if (!query) return null;
  const q = query.toLowerCase();
  return SYMBOLS.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.base.toLowerCase().includes(q),
  );
}

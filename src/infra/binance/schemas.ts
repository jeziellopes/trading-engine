import { z } from "zod";

const PriceLevel = z.tuple([z.string(), z.string()]);

/** Binance REST /api/v3/depth response. */
export const DepthSnapshotSchema = z.object({
  lastUpdateId: z.number(),
  bids: z.array(PriceLevel),
  asks: z.array(PriceLevel),
});
export type DepthSnapshotMsg = z.infer<typeof DepthSnapshotSchema>;

/** Binance WebSocket depth update event (diff depth stream). */
export const DepthUpdateSchema = z.object({
  e: z.literal("depthUpdate"),
  E: z.number(), // event time
  s: z.string(), // symbol
  U: z.number(), // first update ID in event
  u: z.number(), // final update ID in event
  b: z.array(PriceLevel), // bid deltas
  a: z.array(PriceLevel), // ask deltas
});
export type DepthUpdateMsg = z.infer<typeof DepthUpdateSchema>;

/** Binance WebSocket trade event. */
export const TradeEventSchema = z.object({
  e: z.literal("trade"),
  E: z.number(), // event time
  s: z.string(), // symbol
  t: z.number(), // trade ID
  p: z.string(), // price
  q: z.string(), // quantity
  T: z.number(), // trade time
  m: z.boolean(), // is buyer maker
});
export type TradeEventMsg = z.infer<typeof TradeEventSchema>;

/** Discriminated union for all stream messages this app consumes. */
export const StreamMessageSchema = z.discriminatedUnion("e", [DepthUpdateSchema, TradeEventSchema]);
export type StreamMessage = z.infer<typeof StreamMessageSchema>;

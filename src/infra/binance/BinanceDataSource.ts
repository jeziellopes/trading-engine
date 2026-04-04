import type { MarketDataSource } from "@/domain/market-data/MarketDataSource";
import type {
  NormalizedDepthUpdate,
  NormalizedSnapshot,
  NormalizedTrade,
} from "@/domain/market-data/normalized";
import type { ConnectionStatus } from "@/domain/market-data/types";
import { createReconnectManager } from "@/infra/reconnect";
import type { StreamMessage } from "./schemas";
import { fetchDepthSnapshot } from "./snapshot";
import { createWsClient } from "./ws-client";

/**
 * Implements MarketDataSource against the Binance public WebSocket and REST APIs.
 *
 * Lifecycle per symbol:
 *  1. connect(symbol)  — opens combined stream, starts buffering depth events
 *  2. getSnapshot(symbol) — fetches REST snapshot, flushes buffer (AC-1, AC-3)
 *     → onDepthUpdate callbacks start receiving live deltas (AC-2)
 *     → onStatusChange fires 'connected'
 *  3. On WS disconnect — fires 'reconnecting', schedules reconnect (AC-4, AC-5)
 *  4. On reconnect     — repeats from step 1, fires 'connected' when ready (AC-6)
 *  5. connect(newSymbol) — disconnects previous cleanly (AC-8)
 */
export class BinanceDataSource implements MarketDataSource {
  private wsClient = createWsClient({
    onMessage: (msg) => {
      this.handleMessage(msg);
    },
    onDisconnect: () => {
      this.handleDisconnect();
    },
  });

  private reconnectManager = createReconnectManager();

  private statusCallbacks: Array<(s: ConnectionStatus) => void> = [];
  private depthCallbacks: Array<(u: NormalizedDepthUpdate) => void> = [];
  private tradeCallbacks: Array<(t: NormalizedTrade) => void> = [];

  /** Depth events received before the snapshot was applied. */
  private depthBuffer: NormalizedDepthUpdate[] = [];
  /** lastUpdateId from the most recently applied snapshot. null = snapshot not yet applied. */
  private snapshotSeqId: number | null = null;
  private currentSymbol: string | null = null;

  constructor() {
    this.reconnectManager.onReconnect(() => {
      if (this.currentSymbol !== null) {
        this.connectStreams(this.currentSymbol);
        // Re-fetch snapshot and flush (AC-4, AC-6)
        void this.getSnapshot(this.currentSymbol).then(() => {
          this.emitStatus("connected");
        });
      }
    });
  }

  connect(symbol: string): void {
    this.currentSymbol = symbol;
    this.snapshotSeqId = null;
    this.depthBuffer = [];
    this.reconnectManager.reset();
    this.connectStreams(symbol);
  }

  disconnect(): void {
    this.reconnectManager.reset();
    this.wsClient.close();
    this.currentSymbol = null;
    this.snapshotSeqId = null;
    this.depthBuffer = [];
  }

  async getSnapshot(symbol: string): Promise<NormalizedSnapshot> {
    const snapshot = await fetchDepthSnapshot(symbol);
    // Flush the buffer: discard stale events, deliver valid ones (AC-3)
    this.snapshotSeqId = snapshot.sequenceId;
    const buffered = this.depthBuffer;
    this.depthBuffer = [];
    for (const event of buffered) {
      if (event.lastSequenceId > snapshot.sequenceId) {
        this.emitDepthUpdate(event);
      }
    }
    return snapshot;
  }

  onStatusChange(cb: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(cb);
  }

  onDepthUpdate(cb: (update: NormalizedDepthUpdate) => void): void {
    this.depthCallbacks.push(cb);
  }

  onTrade(cb: (trade: NormalizedTrade) => void): void {
    this.tradeCallbacks.push(cb);
  }

  private connectStreams(symbol: string): void {
    const s = symbol.toLowerCase();
    this.wsClient.connect([`${s}@depth`, `${s}@trade`]);
    this.emitStatus("reconnecting");
  }

  private handleMessage(msg: StreamMessage): void {
    if (msg.e === "depthUpdate") {
      const update: NormalizedDepthUpdate = {
        bids: msg.b,
        asks: msg.a,
        firstSequenceId: msg.U,
        lastSequenceId: msg.u,
      };
      if (this.snapshotSeqId === null) {
        // Buffer until snapshot is applied
        this.depthBuffer.push(update);
      } else if (update.lastSequenceId > this.snapshotSeqId) {
        this.emitDepthUpdate(update);
      }
      // else: stale event — discard (AC-3)
    } else if (msg.e === "trade") {
      const trade: NormalizedTrade = {
        id: String(msg.t),
        price: msg.p,
        quantity: msg.q,
        time: msg.T,
        isBuyerMaker: msg.m,
      };
      this.emitTrade(trade);
    }
  }

  private handleDisconnect(): void {
    this.snapshotSeqId = null;
    this.depthBuffer = [];
    this.emitStatus("reconnecting");
    this.reconnectManager.trigger();
  }

  private emitStatus(status: ConnectionStatus): void {
    for (const cb of this.statusCallbacks) cb(status);
  }

  private emitDepthUpdate(update: NormalizedDepthUpdate): void {
    for (const cb of this.depthCallbacks) cb(update);
  }

  private emitTrade(trade: NormalizedTrade): void {
    for (const cb of this.tradeCallbacks) cb(trade);
  }
}

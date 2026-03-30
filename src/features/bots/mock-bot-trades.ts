import type { BotTrade } from "./types";

const now = Date.now();
const m = (mins: number) => now - mins * 60 * 1000;

export const MOCK_BOT_TRADES: Record<string, BotTrade[]> = {
  "bot-1": [
    { id: "t1-1", side: "buy",  price: 67100.0, qty: 0.0015, pnl: 0,     executedAt: m(180) },
    { id: "t1-2", side: "sell", price: 67380.5, qty: 0.0015, pnl: 42.1,  executedAt: m(162) },
    { id: "t1-3", side: "buy",  price: 67200.0, qty: 0.0020, pnl: 0,     executedAt: m(145) },
    { id: "t1-4", side: "sell", price: 67510.0, qty: 0.0020, pnl: 62.0,  executedAt: m(128) },
    { id: "t1-5", side: "buy",  price: 67050.0, qty: 0.0015, pnl: 0,     executedAt: m(110) },
    { id: "t1-6", side: "sell", price: 67290.0, qty: 0.0015, pnl: 36.0,  executedAt: m(92)  },
    { id: "t1-7", side: "buy",  price: 67300.0, qty: 0.0018, pnl: 0,     executedAt: m(75)  },
    { id: "t1-8", side: "sell", price: 67620.0, qty: 0.0018, pnl: 57.6,  executedAt: m(55)  },
    { id: "t1-9", side: "buy",  price: 67400.0, qty: 0.0015, pnl: 0,     executedAt: m(38)  },
    { id: "t1-10",side: "sell", price: 67843.5, qty: 0.0015, pnl: 66.5,  executedAt: m(12)  },
  ],
  "bot-2": [
    { id: "t2-1", side: "buy",  price: 3320.0,  qty: 0.1500, pnl: 0,     executedAt: m(1440) },
    { id: "t2-2", side: "sell", price: 3345.0,  qty: 0.1500, pnl: 37.5,  executedAt: m(1200) },
    { id: "t2-3", side: "buy",  price: 3300.0,  qty: 0.2000, pnl: 0,     executedAt: m(960)  },
    { id: "t2-4", side: "sell", price: 3280.0,  qty: 0.2000, pnl: -40.0, executedAt: m(720)  },
    { id: "t2-5", side: "buy",  price: 3270.0,  qty: 0.1500, pnl: 0,     executedAt: m(480)  },
    { id: "t2-6", side: "sell", price: 3310.0,  qty: 0.1500, pnl: 60.0,  executedAt: m(240)  },
  ],
  "bot-3": [
    { id: "t3-1", side: "buy",  price: 142.0,   qty: 2.0000, pnl: 0,     executedAt: m(2880) },
    { id: "t3-2", side: "sell", price: 138.5,   qty: 2.0000, pnl: -7.0,  executedAt: m(2400) },
    { id: "t3-3", side: "buy",  price: 140.0,   qty: 2.0000, pnl: 0,     executedAt: m(1920) },
    { id: "t3-4", side: "sell", price: 136.0,   qty: 2.0000, pnl: -8.0,  executedAt: m(1440) },
    { id: "t3-5", side: "buy",  price: 138.0,   qty: 2.0000, pnl: 0,     executedAt: m(960)  },
    { id: "t3-6", side: "sell", price: 134.5,   qty: 2.0000, pnl: -7.0,  executedAt: m(480)  },
  ],
};

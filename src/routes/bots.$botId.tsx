import { createFileRoute, Link } from '@tanstack/react-router'
import { ErrorBoundary } from '@/ui/error-boundary'
import { useState } from 'react'
import { ArrowLeft, Pencil, X, Check, Play, Pause, Square } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts'
import { MOCK_BOTS } from '@/features/bots/mock-bots'
import { MOCK_BOT_TRADES } from '@/features/bots/mock-bot-trades'
import type { BotStrategy, BotStatus } from '@/features/bots/types'

export const Route = createFileRoute('/bots/$botId')({
  component: BotDetailPage,
})

const STRATEGIES: BotStrategy[] = ['grid', 'dca', 'rsi', 'macd']

function statusColors(status: BotStatus) {
  if (status === 'running') return { bg: 'var(--trading-bid-muted)', color: 'var(--trading-bid)' }
  if (status === 'paused') return { bg: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
  return { bg: 'var(--trading-ask-muted)', color: 'var(--trading-ask)' }
}

function BotDetailPage() {
  const { botId } = Route.useParams()
  const botData = MOCK_BOTS.find((b) => b.id === botId)

  const [bot, setBot] = useState<typeof botData>(botData)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: '', strategy: '' as BotStrategy, symbol: '' })

  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-muted-foreground text-sm">Bot not found</p>
        <Link to="/" className="text-xs text-primary underline cursor-pointer">Back to dashboard</Link>
      </div>
    )
  }

  const trades = MOCK_BOT_TRADES[botId] ?? []
  const totalPnl = bot.realizedPnl + bot.unrealizedPnl
  const winRate = bot.tradeCount > 0 ? ((bot.winCount / bot.tradeCount) * 100).toFixed(0) : '0'
  const sc = statusColors(bot.status)

  function startEdit() {
    if (!bot) return
    setDraft({ name: bot.name, strategy: bot.strategy, symbol: bot.symbol })
    setEditing(true)
  }

  function saveEdit() {
    if (!bot) return
    setBot({ ...bot, name: draft.name, strategy: draft.strategy, symbol: draft.symbol })
    setEditing(false)
  }

  function changeStatus(status: BotStatus) {
    if (!bot) return
    setBot({ ...bot, status })
  }

  return (
    <ErrorBoundary>
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <title>{bot ? `${bot.name} | Trading Engine` : 'Bot | Trading Engine'}</title>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            // biome-ignore lint/suspicious/noExplicitAny: codegen pending
            to={'/symbol/$symbol' as any}
            // biome-ignore lint/suspicious/noExplicitAny: codegen pending
            params={{ symbol: bot.symbol } as any}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} /> {bot.symbol}
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <h1 className="font-cypher font-bold text-lg">{bot.name}</h1>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide font-semibold"
            style={{ backgroundColor: sc.bg, color: sc.color }}
          >
            {bot.status}
          </span>

          <div className="flex-1" />

          {/* Status controls */}
          <div className="flex items-center gap-1">
            {bot.status !== 'running' && (
              <button
                onClick={() => changeStatus('running')}
                className="flex items-center gap-1.5 px-3 h-7 rounded text-xs cursor-pointer hover:bg-muted transition-colors"
                style={{ color: 'var(--trading-bid)' }}
              >
                <Play size={11} /> Run
              </button>
            )}
            {bot.status === 'running' && (
              <button
                onClick={() => changeStatus('paused')}
                className="flex items-center gap-1.5 px-3 h-7 rounded text-xs cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Pause size={11} /> Pause
              </button>
            )}
            {bot.status !== 'stopped' && (
              <button
                onClick={() => changeStatus('stopped')}
                className="flex items-center gap-1.5 px-3 h-7 rounded text-xs cursor-pointer hover:bg-muted transition-colors"
                style={{ color: 'var(--trading-ask)' }}
              >
                <Square size={11} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: 'Strategy', value: bot.strategy.toUpperCase() },
            { label: 'Symbol', value: bot.symbol },
            { label: 'Total P&L', value: (totalPnl >= 0 ? '+' : '') + totalPnl.toFixed(2), pnl: totalPnl },
            { label: 'Win Rate', value: winRate + '%' },
            { label: 'Trades', value: String(bot.tradeCount) },
            { label: 'Wins', value: String(bot.winCount) },
            { label: 'Realized', value: bot.realizedPnl.toFixed(2), pnl: bot.realizedPnl },
            { label: 'Unrealized', value: bot.unrealizedPnl.toFixed(2), pnl: bot.unrealizedPnl },
          ].map(({ label, value, pnl }) => (
            <div key={label} className="rounded-md border border-border/60 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p
                className="font-mono text-sm font-semibold"
                style={pnl !== undefined ? { color: pnl >= 0 ? 'var(--trading-profit)' : 'var(--trading-loss)' } : undefined}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart + Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* P&L Chart — 2/3 */}
          <div className="lg:col-span-2 rounded-md border border-border/60 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">P&L History</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={bot.pnlHistory.map((v, i) => ({ tick: i + 1, pnl: v }))}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="tick"
                  tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `T${v}`}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 0 ? `+${v}` : String(v))}
                  width={36}
                />
                <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    fontSize: 11,
                    color: 'var(--color-foreground)',
                  }}
                  formatter={(value) => { const n = Number(value); return [(n >= 0 ? '+' : '') + n.toFixed(2), 'P&L'] }}
                  labelFormatter={(label) => `Trade ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke={totalPnl >= 0 ? 'var(--trading-profit)' : 'var(--trading-loss)'}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Settings — 1/3 */}
          <div className="rounded-md border border-border/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Settings</p>
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1 w-6 h-6 rounded justify-center cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Edit settings"
                  aria-label="Edit settings"
                >
                  <Pencil size={11} />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={saveEdit}
                    className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:bg-muted transition-colors"
                    style={{ color: 'var(--trading-profit)' }}
                    title="Save"
                    aria-label="Save settings"
                  >
                    <Check size={11} />
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center justify-center w-6 h-6 rounded cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Cancel"
                    aria-label="Cancel edit"
                  >
                    <X size={11} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label htmlFor="bot-name-input" className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Name</label>
                {editing ? (
                  <input
                    id="bot-name-input"
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                ) : (
                  <p className="text-xs font-mono">{bot.name}</p>
                )}
              </div>

              {/* Strategy */}
              <div>
                <label htmlFor="bot-strategy-select" className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Strategy</label>
                {editing ? (
                  <select
                    id="bot-strategy-select"
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
                    value={draft.strategy}
                    onChange={(e) => setDraft({ ...draft, strategy: e.target.value as BotStrategy })}
                  >
                    {STRATEGIES.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-mono uppercase">{bot.strategy}</p>
                )}
              </div>

              {/* Symbol */}
              <div>
                <label htmlFor="bot-symbol-input" className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Symbol</label>
                {editing ? (
                  <input
                    id="bot-symbol-input"
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
                    value={draft.symbol}
                    onChange={(e) => setDraft({ ...draft, symbol: e.target.value.toUpperCase() })}
                  />
                ) : (
                  <p className="text-xs font-mono">{bot.symbol}</p>
                )}
              </div>

              {/* Started */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Started</label>
                <p className="text-xs font-mono text-muted-foreground">
                  {new Date(bot.startedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trades table */}
        <div className="rounded-md border border-border/60">
          <div className="px-4 py-3 border-b border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Trade History</p>
          </div>
          {trades.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">No trades recorded</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {['Side', 'Price', 'Qty', 'P&L', 'Time'].map((col) => (
                    <th key={col} className="px-4 py-2 text-left text-[10px] text-muted-foreground font-normal uppercase tracking-wide">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2">
                      <span
                        className="font-mono font-semibold uppercase text-[10px]"
                        style={{ color: trade.side === 'buy' ? 'var(--trading-bid)' : 'var(--trading-ask)' }}
                      >
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono">{trade.price.toLocaleString()}</td>
                    <td className="px-4 py-2 font-mono">{trade.qty.toFixed(4)}</td>
                    <td className="px-4 py-2">
                      <span
                        className="font-mono"
                        style={{ color: trade.pnl >= 0 ? 'var(--trading-profit)' : 'var(--trading-loss)' }}
                      >
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(trade.executedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
    </ErrorBoundary>
  )
}

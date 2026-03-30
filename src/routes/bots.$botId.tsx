import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { MOCK_BOTS } from '@/features/bots/mock-bots'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts'

export const Route = createFileRoute('/bots/$botId')({
  component: BotDetailPage,
})

function BotDetailPage() {
  const { botId } = Route.useParams()
  const bot = MOCK_BOTS.find((b) => b.id === botId)

  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-muted-foreground text-sm">Bot not found</p>
        <Link to="/" className="text-xs text-primary underline">Back to terminal</Link>
      </div>
    )
  }

  const totalPnl = bot.realizedPnl + bot.unrealizedPnl
  const winRate = bot.tradeCount > 0 ? ((bot.winCount / bot.tradeCount) * 100).toFixed(0) : '0'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> Terminal
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-cypher font-bold text-lg">{bot.name}</h1>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide"
          style={{
            backgroundColor: bot.status === 'running' ? 'var(--trading-bid-muted)' : 'var(--color-muted)',
            color: bot.status === 'running' ? 'var(--trading-bid)' : 'var(--color-muted-foreground)',
          }}
        >
          {bot.status}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Strategy', value: bot.strategy.toUpperCase() },
          { label: 'Symbol', value: bot.symbol },
          { label: 'Total P&L', value: (totalPnl >= 0 ? '+' : '') + totalPnl.toFixed(2) },
          { label: 'Win Rate', value: winRate + '%' },
          { label: 'Trades', value: String(bot.tradeCount) },
          { label: 'Wins', value: String(bot.winCount) },
          { label: 'Realized', value: bot.realizedPnl.toFixed(2) },
          { label: 'Unrealized', value: bot.unrealizedPnl.toFixed(2) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-md border border-border/60 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="font-mono text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* P&L Chart */}
      <div className="rounded-md border border-border/60 p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">P&L History</p>
        <ResponsiveContainer width="100%" height={160}>
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
    </div>
  )
}

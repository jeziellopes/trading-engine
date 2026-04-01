import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select } from "@/ui/select";

const ALLOWED_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "DOTUSDT",
] as const;

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

const STRATEGIES = ["grid", "dca", "rsi", "macd"] as const;

function isPositiveNumber(v: string): boolean {
  const n = Number(v);
  return !Number.isNaN(n) && Number.isFinite(n) && n > 0;
}

function isIntegerInRange(v: string, min: number, max: number): boolean {
  const n = Number(v);
  return !Number.isNaN(n) && Number.isFinite(n) && Number.isInteger(n) && n >= min && n <= max;
}

function isNumberInRange(v: string, min: number, max: number): boolean {
  const n = Number(v);
  return !Number.isNaN(n) && Number.isFinite(n) && n >= min && n <= max;
}

const botConfigSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
    strategy: z.enum(STRATEGIES),
    symbol: z.enum(ALLOWED_SYMBOLS),
    interval: z.enum(INTERVALS),
    // Grid params
    gridLowerPrice: z.string(),
    gridUpperPrice: z.string(),
    gridCount: z.string(),
    gridAmountPerGrid: z.string(),
    // DCA params
    dcaBaseAmount: z.string(),
    dcaSafetyAmount: z.string(),
    dcaMaxSafetyOrders: z.string(),
    dcaPriceDeviation: z.string(),
    // RSI params
    rsiPeriod: z.string(),
    rsiOversold: z.string(),
    rsiOverbought: z.string(),
    rsiPositionSize: z.string(),
    // MACD params
    macdFastPeriod: z.string(),
    macdSlowPeriod: z.string(),
    macdSignalPeriod: z.string(),
    macdPositionSize: z.string(),
    // Risk controls
    maxDrawdown: z.string().refine((v) => isNumberInRange(v, 1, 100), {
      message: "Must be between 1% and 100%",
    }),
    stopLoss: z.string().refine((v) => isNumberInRange(v, 0.1, 100), {
      message: "Must be between 0.1% and 100%",
    }),
    takeProfit: z.string().refine((v) => isNumberInRange(v, 0.1, 1000), {
      message: "Must be between 0.1% and 1000%",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.strategy === "grid") {
      if (!isPositiveNumber(data.gridLowerPrice)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["gridLowerPrice"],
        });
      }
      if (!isPositiveNumber(data.gridUpperPrice)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["gridUpperPrice"],
        });
      }
      if (
        isPositiveNumber(data.gridLowerPrice) &&
        isPositiveNumber(data.gridUpperPrice) &&
        Number(data.gridUpperPrice) <= Number(data.gridLowerPrice)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Upper price must be greater than lower price",
          path: ["gridUpperPrice"],
        });
      }
      if (!isIntegerInRange(data.gridCount, 2, 100)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 2 and 100",
          path: ["gridCount"],
        });
      }
      if (!isPositiveNumber(data.gridAmountPerGrid)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["gridAmountPerGrid"],
        });
      }
    }

    if (data.strategy === "dca") {
      if (!isPositiveNumber(data.dcaBaseAmount)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["dcaBaseAmount"],
        });
      }
      if (!isPositiveNumber(data.dcaSafetyAmount)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["dcaSafetyAmount"],
        });
      }
      if (!isIntegerInRange(data.dcaMaxSafetyOrders, 1, 50)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 1 and 50",
          path: ["dcaMaxSafetyOrders"],
        });
      }
      if (!isNumberInRange(data.dcaPriceDeviation, 0.1, 50)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be between 0.1% and 50%",
          path: ["dcaPriceDeviation"],
        });
      }
    }

    if (data.strategy === "rsi") {
      if (!isIntegerInRange(data.rsiPeriod, 2, 100)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 2 and 100",
          path: ["rsiPeriod"],
        });
      }
      if (!isIntegerInRange(data.rsiOversold, 1, 49)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 1 and 49",
          path: ["rsiOversold"],
        });
      }
      if (!isIntegerInRange(data.rsiOverbought, 51, 99)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 51 and 99",
          path: ["rsiOverbought"],
        });
      }
      if (!isPositiveNumber(data.rsiPositionSize)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["rsiPositionSize"],
        });
      }
    }

    if (data.strategy === "macd") {
      if (!isIntegerInRange(data.macdFastPeriod, 2, 100)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 2 and 100",
          path: ["macdFastPeriod"],
        });
      }
      if (!isIntegerInRange(data.macdSlowPeriod, 2, 100)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 2 and 100",
          path: ["macdSlowPeriod"],
        });
      }
      if (
        isIntegerInRange(data.macdFastPeriod, 2, 100) &&
        isIntegerInRange(data.macdSlowPeriod, 2, 100) &&
        Number(data.macdSlowPeriod) <= Number(data.macdFastPeriod)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Slow period must be greater than fast period",
          path: ["macdSlowPeriod"],
        });
      }
      if (!isIntegerInRange(data.macdSignalPeriod, 2, 100)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be an integer between 2 and 100",
          path: ["macdSignalPeriod"],
        });
      }
      if (!isPositiveNumber(data.macdPositionSize)) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a positive number",
          path: ["macdPositionSize"],
        });
      }
    }
  });

export type BotConfigFormData = z.infer<typeof botConfigSchema>;

export interface BotConfigFormProps {
  onSubmit: (data: BotConfigFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function FormField({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs mt-1 text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function BotConfigForm({ onSubmit, onCancel, isLoading = false }: BotConfigFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BotConfigFormData>({
    resolver: zodResolver(botConfigSchema),
    defaultValues: {
      name: "",
      strategy: "grid",
      symbol: "BTCUSDT",
      interval: "1m",
      gridLowerPrice: "",
      gridUpperPrice: "",
      gridCount: "",
      gridAmountPerGrid: "",
      dcaBaseAmount: "",
      dcaSafetyAmount: "",
      dcaMaxSafetyOrders: "",
      dcaPriceDeviation: "",
      rsiPeriod: "",
      rsiOversold: "",
      rsiOverbought: "",
      rsiPositionSize: "",
      macdFastPeriod: "",
      macdSlowPeriod: "",
      macdSignalPeriod: "",
      macdPositionSize: "",
      maxDrawdown: "10",
      stopLoss: "5",
      takeProfit: "10",
    },
  });

  const strategy = watch("strategy");
  const symbol = watch("symbol");
  const busy = isLoading || isSubmitting;

  // Auto-generate name from strategy + symbol
  useEffect(() => {
    const strategyLabel = strategy.toUpperCase();
    setValue("name", `${strategyLabel} ${symbol} #1`);
  }, [strategy, symbol, setValue]);

  const internalSubmit = async (data: BotConfigFormData) => {
    await onSubmit(data);
    toast.success("Bot created successfully");
  };

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-4 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-medium">Configure New Bot</h3>
        </div>
        <Button
          intent="ghost"
          size="xs"
          type="button"
          onClick={onCancel}
          className="w-6 h-6 p-0"
          title="Close"
        >
          <X size={14} />
        </Button>
      </div>

      <form onSubmit={handleSubmit(internalSubmit)} noValidate className="space-y-4">
        {/* Common Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Bot Name" id="bot-name" error={errors.name?.message}>
            <Input
              size="sm"
              id="bot-name"
              type="text"
              {...register("name")}
              disabled={busy}
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "bot-name-error" : undefined}
            />
          </FormField>

          <FormField label="Strategy" id="bot-strategy" error={errors.strategy?.message}>
            <Select
              id="bot-strategy"
              {...register("strategy")}
              disabled={busy}
              aria-invalid={errors.strategy ? "true" : undefined}
              aria-describedby={errors.strategy ? "bot-strategy-error" : undefined}
            >
              {STRATEGIES.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Symbol" id="bot-symbol" error={errors.symbol?.message}>
            <Select
              id="bot-symbol"
              {...register("symbol")}
              disabled={busy}
              aria-invalid={errors.symbol ? "true" : undefined}
              aria-describedby={errors.symbol ? "bot-symbol-error" : undefined}
            >
              {ALLOWED_SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Interval" id="bot-interval" error={errors.interval?.message}>
            <Select
              id="bot-interval"
              {...register("interval")}
              disabled={busy}
              aria-invalid={errors.interval ? "true" : undefined}
              aria-describedby={errors.interval ? "bot-interval-error" : undefined}
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {/* Strategy-specific parameters */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            {strategy.toUpperCase()} Parameters
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {strategy === "grid" && (
              <>
                <FormField
                  label="Lower Price"
                  id="grid-lower-price"
                  error={errors.gridLowerPrice?.message}
                >
                  <Input
                    size="sm"
                    id="grid-lower-price"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register("gridLowerPrice")}
                    disabled={busy}
                    aria-invalid={errors.gridLowerPrice ? "true" : undefined}
                    aria-describedby={errors.gridLowerPrice ? "grid-lower-price-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Upper Price"
                  id="grid-upper-price"
                  error={errors.gridUpperPrice?.message}
                >
                  <Input
                    size="sm"
                    id="grid-upper-price"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register("gridUpperPrice")}
                    disabled={busy}
                    aria-invalid={errors.gridUpperPrice ? "true" : undefined}
                    aria-describedby={errors.gridUpperPrice ? "grid-upper-price-error" : undefined}
                  />
                </FormField>
                <FormField label="Grid Count" id="grid-count" error={errors.gridCount?.message}>
                  <Input
                    size="sm"
                    id="grid-count"
                    type="number"
                    step="1"
                    placeholder="10"
                    {...register("gridCount")}
                    disabled={busy}
                    aria-invalid={errors.gridCount ? "true" : undefined}
                    aria-describedby={errors.gridCount ? "grid-count-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Amount Per Grid"
                  id="grid-amount"
                  error={errors.gridAmountPerGrid?.message}
                >
                  <Input
                    size="sm"
                    id="grid-amount"
                    type="number"
                    step="any"
                    placeholder="0.001"
                    {...register("gridAmountPerGrid")}
                    disabled={busy}
                    aria-invalid={errors.gridAmountPerGrid ? "true" : undefined}
                    aria-describedby={errors.gridAmountPerGrid ? "grid-amount-error" : undefined}
                  />
                </FormField>
              </>
            )}

            {strategy === "dca" && (
              <>
                <FormField
                  label="Base Amount"
                  id="dca-base-amount"
                  error={errors.dcaBaseAmount?.message}
                >
                  <Input
                    size="sm"
                    id="dca-base-amount"
                    type="number"
                    step="any"
                    placeholder="100"
                    {...register("dcaBaseAmount")}
                    disabled={busy}
                    aria-invalid={errors.dcaBaseAmount ? "true" : undefined}
                    aria-describedby={errors.dcaBaseAmount ? "dca-base-amount-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Safety Amount"
                  id="dca-safety-amount"
                  error={errors.dcaSafetyAmount?.message}
                >
                  <Input
                    size="sm"
                    id="dca-safety-amount"
                    type="number"
                    step="any"
                    placeholder="50"
                    {...register("dcaSafetyAmount")}
                    disabled={busy}
                    aria-invalid={errors.dcaSafetyAmount ? "true" : undefined}
                    aria-describedby={
                      errors.dcaSafetyAmount ? "dca-safety-amount-error" : undefined
                    }
                  />
                </FormField>
                <FormField
                  label="Max Safety Orders"
                  id="dca-max-safety"
                  error={errors.dcaMaxSafetyOrders?.message}
                >
                  <Input
                    size="sm"
                    id="dca-max-safety"
                    type="number"
                    step="1"
                    placeholder="5"
                    {...register("dcaMaxSafetyOrders")}
                    disabled={busy}
                    aria-invalid={errors.dcaMaxSafetyOrders ? "true" : undefined}
                    aria-describedby={
                      errors.dcaMaxSafetyOrders ? "dca-max-safety-error" : undefined
                    }
                  />
                </FormField>
                <FormField
                  label="Price Deviation (%)"
                  id="dca-price-dev"
                  error={errors.dcaPriceDeviation?.message}
                >
                  <Input
                    size="sm"
                    id="dca-price-dev"
                    type="number"
                    step="any"
                    placeholder="2.0"
                    {...register("dcaPriceDeviation")}
                    disabled={busy}
                    aria-invalid={errors.dcaPriceDeviation ? "true" : undefined}
                    aria-describedby={errors.dcaPriceDeviation ? "dca-price-dev-error" : undefined}
                  />
                </FormField>
              </>
            )}

            {strategy === "rsi" && (
              <>
                <FormField label="RSI Period" id="rsi-period" error={errors.rsiPeriod?.message}>
                  <Input
                    size="sm"
                    id="rsi-period"
                    type="number"
                    step="1"
                    placeholder="14"
                    {...register("rsiPeriod")}
                    disabled={busy}
                    aria-invalid={errors.rsiPeriod ? "true" : undefined}
                    aria-describedby={errors.rsiPeriod ? "rsi-period-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Oversold Level"
                  id="rsi-oversold"
                  error={errors.rsiOversold?.message}
                >
                  <Input
                    size="sm"
                    id="rsi-oversold"
                    type="number"
                    step="1"
                    placeholder="30"
                    {...register("rsiOversold")}
                    disabled={busy}
                    aria-invalid={errors.rsiOversold ? "true" : undefined}
                    aria-describedby={errors.rsiOversold ? "rsi-oversold-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Overbought Level"
                  id="rsi-overbought"
                  error={errors.rsiOverbought?.message}
                >
                  <Input
                    size="sm"
                    id="rsi-overbought"
                    type="number"
                    step="1"
                    placeholder="70"
                    {...register("rsiOverbought")}
                    disabled={busy}
                    aria-invalid={errors.rsiOverbought ? "true" : undefined}
                    aria-describedby={errors.rsiOverbought ? "rsi-overbought-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Position Size"
                  id="rsi-position-size"
                  error={errors.rsiPositionSize?.message}
                >
                  <Input
                    size="sm"
                    id="rsi-position-size"
                    type="number"
                    step="any"
                    placeholder="0.01"
                    {...register("rsiPositionSize")}
                    disabled={busy}
                    aria-invalid={errors.rsiPositionSize ? "true" : undefined}
                    aria-describedby={
                      errors.rsiPositionSize ? "rsi-position-size-error" : undefined
                    }
                  />
                </FormField>
              </>
            )}

            {strategy === "macd" && (
              <>
                <FormField
                  label="Fast Period"
                  id="macd-fast"
                  error={errors.macdFastPeriod?.message}
                >
                  <Input
                    size="sm"
                    id="macd-fast"
                    type="number"
                    step="1"
                    placeholder="12"
                    {...register("macdFastPeriod")}
                    disabled={busy}
                    aria-invalid={errors.macdFastPeriod ? "true" : undefined}
                    aria-describedby={errors.macdFastPeriod ? "macd-fast-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Slow Period"
                  id="macd-slow"
                  error={errors.macdSlowPeriod?.message}
                >
                  <Input
                    size="sm"
                    id="macd-slow"
                    type="number"
                    step="1"
                    placeholder="26"
                    {...register("macdSlowPeriod")}
                    disabled={busy}
                    aria-invalid={errors.macdSlowPeriod ? "true" : undefined}
                    aria-describedby={errors.macdSlowPeriod ? "macd-slow-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Signal Period"
                  id="macd-signal"
                  error={errors.macdSignalPeriod?.message}
                >
                  <Input
                    size="sm"
                    id="macd-signal"
                    type="number"
                    step="1"
                    placeholder="9"
                    {...register("macdSignalPeriod")}
                    disabled={busy}
                    aria-invalid={errors.macdSignalPeriod ? "true" : undefined}
                    aria-describedby={errors.macdSignalPeriod ? "macd-signal-error" : undefined}
                  />
                </FormField>
                <FormField
                  label="Position Size"
                  id="macd-position-size"
                  error={errors.macdPositionSize?.message}
                >
                  <Input
                    size="sm"
                    id="macd-position-size"
                    type="number"
                    step="any"
                    placeholder="0.01"
                    {...register("macdPositionSize")}
                    disabled={busy}
                    aria-invalid={errors.macdPositionSize ? "true" : undefined}
                    aria-describedby={
                      errors.macdPositionSize ? "macd-position-size-error" : undefined
                    }
                  />
                </FormField>
              </>
            )}
          </div>
        </div>

        {/* Risk Controls */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Risk Controls
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField
              label="Max Drawdown (%)"
              id="max-drawdown"
              error={errors.maxDrawdown?.message}
            >
              <Input
                size="sm"
                id="max-drawdown"
                type="number"
                step="any"
                placeholder="10"
                {...register("maxDrawdown")}
                disabled={busy}
                aria-invalid={errors.maxDrawdown ? "true" : undefined}
                aria-describedby={errors.maxDrawdown ? "max-drawdown-error" : undefined}
              />
            </FormField>
            <FormField label="Stop Loss (%)" id="stop-loss" error={errors.stopLoss?.message}>
              <Input
                size="sm"
                id="stop-loss"
                type="number"
                step="any"
                placeholder="5"
                {...register("stopLoss")}
                disabled={busy}
                aria-invalid={errors.stopLoss ? "true" : undefined}
                aria-describedby={errors.stopLoss ? "stop-loss-error" : undefined}
              />
            </FormField>
            <FormField label="Take Profit (%)" id="take-profit" error={errors.takeProfit?.message}>
              <Input
                size="sm"
                id="take-profit"
                type="number"
                step="any"
                placeholder="10"
                {...register("takeProfit")}
                disabled={busy}
                aria-invalid={errors.takeProfit ? "true" : undefined}
                aria-describedby={errors.takeProfit ? "take-profit-error" : undefined}
              />
            </FormField>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button intent="ghost" size="sm" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button intent="primary" size="sm" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create Bot"}
          </Button>
        </div>
      </form>
    </div>
  );
}

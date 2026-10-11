import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { calcWaterInvestmentROI } from "@/services/openDataAPI";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function formatM3(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M м³`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K м³`;
  return `${v} м³`;
}

// ─── Slider Field ─────────────────────────────────────────────────────────────

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {label}
        </span>
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: "#00e6c8" }}
        >
          {format(value)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div
          className="absolute w-full h-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        {/* Fill */}
        <div
          className="absolute h-1 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #00e6c8, #00b4ff)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-5 appearance-none bg-transparent cursor-pointer"
          style={{
            // Webkit thumb
            WebkitAppearance: "none",
          }}
        />
      </div>
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00e6c8;
          box-shadow: 0 0 0 3px rgba(0,230,200,0.2);
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00e6c8;
          box-shadow: 0 0 0 3px rgba(0,230,200,0.2);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-3 border flex-1 min-w-0"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: `${color}25`,
      }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </div>
      <div className="text-base font-black leading-tight" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div
          className="text-[10px] mt-0.5"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      className="px-3 py-2 rounded-xl border text-xs"
      style={{
        background: "rgba(0,8,30,0.95)",
        borderColor: "rgba(0,230,200,0.25)",
        color: "#fff",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.45)" }}>Год {label}</div>
      <div
        className="font-bold mt-0.5"
        style={{ color: val >= 0 ? "#00e6c8" : "#ff6b6b" }}
      >
        {val >= 0 ? "+" : ""}
        {formatUSD(val)}
      </div>
    </div>
  );
}

// ─── ROI Calculator ───────────────────────────────────────────────────────────

export default function ROICalculator() {
  const [investment, setInvestment] = useState(5_000_000);
  const [waterSavings, setWaterSavings] = useState(500_000);
  const [waterPrice, setWaterPrice] = useState(0.30);
  const [opex, setOpex] = useState(100_000);
  const [discountRate, setDiscountRate] = useState(8);
  const [horizon, setHorizon] = useState(20);

  const result = useMemo(
    () =>
      calcWaterInvestmentROI(
        investment,
        waterSavings,
        waterPrice,
        opex,
        discountRate / 100,
        horizon,
      ),
    [investment, waterSavings, waterPrice, opex, discountRate, horizon],
  );

  // Build cumulative cashflow series
  const chartData = useMemo(() => {
    const net = result.net_annual_benefit_usd;
    let cumulative = -investment;
    const data = [{ year: 0, value: cumulative }];
    for (let y = 1; y <= horizon; y++) {
      cumulative += net;
      data.push({ year: y, value: Math.round(cumulative) });
    }
    return data;
  }, [investment, result.net_annual_benefit_usd, horizon]);

  const npvPositive = result.npv_usd >= 0;
  const npvColor = npvPositive ? "#00e6c8" : "#ff6b6b";

  // Y-axis formatter
  const yFormatter = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
  };

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "rgba(0,8,30,0.8)",
        borderColor: "rgba(0,230,200,0.12)",
      }}
    >
      <h3
        className="text-sm font-black uppercase tracking-widest mb-5"
        style={{ color: "#00e6c8" }}
      >
        Калькулятор ROI инвестиций
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {/* ── Left column: sliders ── */}
        <div>
          <SliderField
            label="Объём инвестиций"
            value={investment}
            min={100_000}
            max={50_000_000}
            step={100_000}
            format={formatUSD}
            onChange={setInvestment}
          />
          <SliderField
            label="Экономия воды (м³/год)"
            value={waterSavings}
            min={10_000}
            max={10_000_000}
            step={10_000}
            format={formatM3}
            onChange={setWaterSavings}
          />
          <SliderField
            label="Цена воды ($/м³)"
            value={waterPrice}
            min={0.05}
            max={2.0}
            step={0.05}
            format={(v) => `$${v.toFixed(2)}/м³`}
            onChange={setWaterPrice}
          />
          <SliderField
            label="OPEX ($/год)"
            value={opex}
            min={0}
            max={2_000_000}
            step={10_000}
            format={formatUSD}
            onChange={setOpex}
          />
          <SliderField
            label="Ставка дисконтирования"
            value={discountRate}
            min={5}
            max={20}
            step={1}
            format={(v) => `${v}%`}
            onChange={setDiscountRate}
          />
          <SliderField
            label="Горизонт проекта (лет)"
            value={horizon}
            min={5}
            max={30}
            step={1}
            format={(v) => `${v} лет`}
            onChange={setHorizon}
          />
        </div>

        {/* ── Right column: metrics ── */}
        <div className="flex flex-col justify-between">
          {/* Metrics grid */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <MetricCard
                label="NPV"
                value={formatUSD(result.npv_usd)}
                color={npvColor}
                sub={npvPositive ? "Проект выгоден" : "Проект убыточен"}
              />
              <MetricCard
                label="IRR"
                value={`${result.irr_approx_pct}%`}
                color={result.irr_approx_pct >= discountRate ? "#4ade80" : "#fbbf24"}
                sub={`Ставка: ${discountRate}%`}
              />
            </div>
            <div className="flex gap-2">
              <MetricCard
                label="BCR"
                value={result.bcr.toFixed(2)}
                color={result.bcr >= 1 ? "#00b4ff" : "#ff6b6b"}
                sub={result.bcr >= 1 ? "Доходы > затрат" : "Доходы < затрат"}
              />
              <MetricCard
                label="Срок окупаемости"
                value={
                  result.simple_payback_years === Infinity
                    ? "∞"
                    : `${result.simple_payback_years} лет`
                }
                color="#a78bfa"
                sub="Простой срок"
              />
            </div>
            <div
              className="rounded-xl p-3 border"
              style={{
                background: "rgba(0,230,200,0.04)",
                borderColor: "rgba(0,230,200,0.1)",
              }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Ежегодная чистая выгода
              </div>
              <div
                className="text-lg font-black"
                style={{
                  color:
                    result.net_annual_benefit_usd >= 0 ? "#00e6c8" : "#ff6b6b",
                }}
              >
                {result.net_annual_benefit_usd >= 0 ? "+" : ""}
                {formatUSD(result.net_annual_benefit_usd)}/год
              </div>
              <div
                className="text-[10px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Валовая выгода: {formatUSD(result.annual_benefit_usd)}/год
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cumulative cashflow chart ── */}
      <div className="mt-4">
        <div
          className="text-[10px] font-semibold uppercase tracking-wider mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Накопленный денежный поток (USD)
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e6c8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e6c8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Год",
                  position: "insideBottomRight",
                  offset: -4,
                  fill: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                }}
              />
              <YAxis
                tickFormatter={yFormatter}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Zero reference line via a custom dot at Y=0 is handled by the gradient; add a reference line */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00e6c8"
                strokeWidth={2}
                fill="url(#cfGrad)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#00e6c8",
                  stroke: "rgba(0,8,30,0.9)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Payback annotation */}
        {result.simple_payback_years !== Infinity &&
          result.simple_payback_years <= horizon && (
            <div
              className="mt-2 text-center text-[10px]"
              style={{ color: "rgba(0,230,200,0.5)" }}
            >
              Точка окупаемости ≈ год {result.simple_payback_years}
            </div>
          )}
      </div>
    </div>
  );
}

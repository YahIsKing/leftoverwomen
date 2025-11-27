'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BracketResult } from '@/lib/types';
import { formatNumber } from '@/lib/calculations';

interface SurplusChartProps {
  data: BracketResult[];
  showComparison?: BracketResult[];
  comparisonLabel?: string;
}

// Theme colors matching shadcn/ui dark theme with gold/plum palette
const COLORS = {
  availableMen: 'hsl(183, 19%, 44%)',     // secondary (teal)
  matchedWomen: 'hsl(91, 25%, 63%)',      // success (sage green)
  surplusWomen: 'hsl(31, 69%, 57%)',      // primary (gold)
  comparison: 'hsl(11, 95%, 75%)',        // destructive (coral)
  grid: 'hsl(305, 15%, 22%)',             // border
  text: 'hsl(34, 47%, 57%)',              // foreground
};

export default function SurplusChart({
  data,
  showComparison,
  comparisonLabel = 'Alternative',
}: SurplusChartProps) {
  const chartData = data.map((bracket, index) => ({
    age: bracket.ageBracket,
    'Available Men': bracket.availableMen,
    'Women w/ Prospects': Math.min(bracket.unmarriedWomen, bracket.availableMen),
    'Surplus Women': bracket.surplus,
    ...(showComparison
      ? {
          [`${comparisonLabel} Surplus`]: showComparison[index]?.surplus || 0,
        }
      : {}),
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-foreground mb-2">Age {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="age"
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            axisLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            axisLine={{ stroke: COLORS.grid }}
            tickFormatter={(value) => formatNumber(value)}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px',
            }}
            formatter={(value) => <span style={{ color: COLORS.text }}>{value}</span>}
          />
          <Bar
            dataKey="Available Men"
            stackId="a"
            fill={COLORS.availableMen}
          />
          <Bar
            dataKey="Women w/ Prospects"
            stackId="b"
            fill={COLORS.matchedWomen}
          />
          <Bar
            dataKey="Surplus Women"
            stackId="b"
            fill={COLORS.surplusWomen}
          />
          {showComparison && (
            <Bar
              dataKey={`${comparisonLabel} Surplus`}
              fill={COLORS.comparison}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

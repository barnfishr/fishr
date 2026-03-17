"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AnalysisResult, DIMENSION_LABELS } from "@/lib/types";

interface DimensionChartProps {
  dimensions: AnalysisResult["dimensions"];
}

function getBarColor(score: number): string {
  if (score >= 7) return "#22c55e";
  if (score >= 5) return "#eab308";
  if (score >= 3) return "#f97316";
  return "#ef4444";
}

export default function DimensionChart({ dimensions }: DimensionChartProps) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    name: DIMENSION_LABELS[key] || key,
    score: value.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${value}/10`, "Score"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={28}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

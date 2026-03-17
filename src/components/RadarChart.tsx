"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { AnalysisResult, DIMENSION_LABELS } from "@/lib/types";

interface RadarChartProps {
  dimensions: AnalysisResult["dimensions"];
}

export default function RadarChart({ dimensions }: RadarChartProps) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key] || key,
    score: value.score,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
        <Radar
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}

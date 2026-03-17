"use client";

import { AnalysisResult } from "@/lib/types";
import ScoreGauge from "./ScoreGauge";
import DimensionChart from "./DimensionChart";
import RadarChart from "./RadarChart";
import DimensionCard from "./DimensionCard";
import ConsumerInsightCard from "./ConsumerInsightCard";

interface AnalysisReportProps {
  url: string;
  analysis: AnalysisResult;
  onDownload: () => void;
  isAuthenticated: boolean;
}

export default function AnalysisReport({
  url,
  analysis,
  onDownload,
  isAuthenticated,
}: AnalysisReportProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="mb-2 text-sm text-gray-500">Competitive Angle Analysis for</p>
        <p className="text-lg font-medium text-indigo-600 break-all">{url}</p>
      </div>

      {/* Overall Score */}
      <div className="flex justify-center">
        <div className="relative">
          <ScoreGauge score={analysis.overall_score} />
        </div>
      </div>

      {/* Consumer Insight */}
      <ConsumerInsightCard insight={analysis.consumer_insight} />

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            5 Ways to Sharpen
          </h3>
          <DimensionChart dimensions={analysis.dimensions} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Sharpness Radar
          </h3>
          <RadarChart dimensions={analysis.dimensions} />
        </div>
      </div>

      {/* Dimension Breakdowns */}
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Detailed Breakdown
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Hurdle first, then sharpen — dimensions ordered from highest to lowest priority.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(analysis.dimensions).map(([key, value]) => (
            <DimensionCard key={key} name={key} data={value} />
          ))}
        </div>
      </div>

      {/* Top Actions */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-indigo-900">
          Top Actions to Sharpen Your Angle
        </h2>
        <ol className="space-y-3">
          {analysis.top_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm text-indigo-900">{action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Download CTA */}
      <div className="sticky bottom-4 flex justify-center">
        <button
          onClick={onDownload}
          className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95"
        >
          {isAuthenticated ? "Download Report (PDF)" : "Sign in to Download"}
        </button>
      </div>
    </div>
  );
}

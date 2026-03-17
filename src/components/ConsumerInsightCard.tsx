"use client";

import { ConsumerInsight } from "@/lib/types";

interface ConsumerInsightCardProps {
  insight: ConsumerInsight;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-yellow-600";
  if (score >= 3) return "text-orange-600";
  return "text-red-600";
}

function getBarWidth(score: number): string {
  return `${(score / 10) * 100}%`;
}

function getBarColor(score: number): string {
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-yellow-500";
  if (score >= 3) return "bg-orange-500";
  return "bg-red-500";
}

const INSIGHT_LABELS = {
  lifts_over_hurdle: "Lifts Consumer Over a Hurdle",
  unique_or_different: "Unique or Different",
  personal_connection: "Makes a Personal Connection",
};

export default function ConsumerInsightCard({
  insight,
}: ConsumerInsightCardProps) {
  const items = [
    { key: "lifts_over_hurdle" as const, data: insight.lifts_over_hurdle },
    { key: "unique_or_different" as const, data: insight.unique_or_different },
    { key: "personal_connection" as const, data: insight.personal_connection },
  ];

  return (
    <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
          <svg
            className="h-5 w-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Consumer Insight
          </h3>
          <p className="text-xs text-gray-500">
            The foundation of your competitive angle
          </p>
        </div>
      </div>

      <p className="mb-5 text-sm text-gray-600">{insight.overall_summary}</p>

      <div className="space-y-4">
        {items.map(({ key, data }) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {INSIGHT_LABELS[key]}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
                {data.score}/10
              </span>
            </div>
            <div className="mb-1.5 h-2 w-full rounded-full bg-gray-100">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${getBarColor(data.score)}`}
                style={{ width: getBarWidth(data.score) }}
              />
            </div>
            <p className="text-xs text-gray-500">{data.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

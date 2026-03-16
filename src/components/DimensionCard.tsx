"use client";

import { DimensionScore } from "@/lib/types";

interface DimensionCardProps {
  name: string;
  data: DimensionScore;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (score >= 3) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export default function DimensionCard({ name, data }: DimensionCardProps) {
  const colorClasses = getScoreColor(data.score);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize text-gray-900">
          {name}
        </h3>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-bold ${colorClasses}`}
        >
          {data.score}/10
        </span>
      </div>

      <p className="mb-4 text-sm text-gray-600">{data.summary}</p>

      {data.issues.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-red-700">Issues</h4>
          <ul className="space-y-1">
            {data.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommendations.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-green-700">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

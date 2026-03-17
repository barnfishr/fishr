"use client";

import { DimensionScore, DIMENSION_LABELS, DIMENSION_DESCRIPTIONS } from "@/lib/types";

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

function getPriorityBadge(name: string): string | null {
  const priorities: Record<string, string> = {
    uniqueness: "Highest Priority",
    addressable_need: "High Priority",
    dominate_situation: "Medium Priority",
    reason_to_believe: "Lower Priority",
    quantifiable_support: "Lower Priority",
  };
  return priorities[name] || null;
}

export default function DimensionCard({ name, data }: DimensionCardProps) {
  const colorClasses = getScoreColor(data.score);
  const label = DIMENSION_LABELS[name] || name;
  const description = DIMENSION_DESCRIPTIONS[name];
  const priority = getPriorityBadge(name);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          {priority && (
            <span className="text-xs font-medium text-indigo-500">{priority}</span>
          )}
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-bold ${colorClasses}`}
        >
          {data.score}/10
        </span>
      </div>

      {description && (
        <p className="mb-3 text-xs text-gray-400 italic">{description}</p>
      )}

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

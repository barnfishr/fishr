"use client";

const steps = [
  "Fetching your homepage...",
  "Extracting copy and structure...",
  "Evaluating consumer insight...",
  "Analyzing the 5 ways to sharpen...",
  "Generating recommendations...",
];

interface LoadingStateProps {
  step: number;
}

export default function LoadingState({ step }: LoadingStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-20">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
      <div className="space-y-3 text-center">
        {steps.map((text, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${
              i <= step ? "opacity-100" : "opacity-30"
            }`}
          >
            {i < step ? (
              <span className="text-green-500">&#10003;</span>
            ) : i === step ? (
              <span className="animate-pulse text-indigo-500">&#9679;</span>
            ) : (
              <span className="text-gray-300">&#9675;</span>
            )}
            <span className={i <= step ? "text-gray-700" : "text-gray-400"}>
              {text}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">This usually takes 15-25 seconds</p>
    </div>
  );
}

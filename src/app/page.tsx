"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { AnalysisResult, AnalyzeResponse } from "@/lib/types";
import { generatePDF } from "@/lib/pdf-export";
import AnalysisReport from "@/components/AnalysisReport";
import LoadingState from "@/components/LoadingState";

type AppState = "input" | "loading" | "results" | "error";

export default function Home() {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [appState, setAppState] = useState<AppState>("input");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState("");

  // Animate loading steps
  useEffect(() => {
    if (appState !== "loading") return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [appState]);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) return;

    setAppState("loading");
    setLoadingStep(0);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: AnalyzeResponse = await res.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.data);
      setAnalyzedUrl(data.data.url);
      setAppState("results");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setAppState("error");
    }
  }, [url]);

  const handleDownload = useCallback(() => {
    if (!session) {
      signIn("google");
      return;
    }

    if (!analysis || !analyzedUrl) return;

    const doc = generatePDF(analyzedUrl, analysis);
    const filename = `fishr-report-${new URL(analyzedUrl).hostname}-${Date.now()}.pdf`;
    doc.save(filename);
  }, [session, analysis, analyzedUrl]);

  const handleReset = useCallback(() => {
    setAppState("input");
    setUrl("");
    setAnalysis(null);
    setError("");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={handleReset}
            className="text-2xl font-bold text-indigo-600"
          >
            fishr
          </button>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Input State */}
        {appState === "input" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
            <div className="text-center">
              <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Fix your homepage messaging
                <br />
                <span className="text-indigo-600">in minutes</span>
              </h1>
              <p className="mx-auto max-w-lg text-lg text-gray-600">
                Get a detailed diagnostic of your homepage copy with specific,
                actionable recommendations to improve clarity, persuasion, and
                conversions.
              </p>
            </div>

            <div className="flex w-full max-w-xl gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Enter your website URL"
                className="flex-1 rounded-full border border-gray-300 px-6 py-3 text-base shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <button
                onClick={handleAnalyze}
                disabled={!url.trim()}
                className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze your site
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Free analysis &middot; No credit card required
            </p>
          </div>
        )}

        {/* Loading State */}
        {appState === "loading" && <LoadingState step={loadingStep} />}

        {/* Error State */}
        {appState === "error" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-800">
                Analysis Failed
              </h2>
              <p className="mb-4 text-sm text-red-600">{error}</p>
              <button
                onClick={handleReset}
                className="rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results State */}
        {appState === "results" && analysis && (
          <AnalysisReport
            url={analyzedUrl}
            analysis={analysis}
            onDownload={handleDownload}
            isAuthenticated={!!session}
          />
        )}
      </main>
    </div>
  );
}

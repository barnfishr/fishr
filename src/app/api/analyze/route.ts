import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { analyzeContent } from "@/lib/analyzer";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { url } = body;
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Please provide a valid URL" },
      { status: 400 }
    );
  }

  // Input sanitization: only allow http/https URLs
  const normalized = url.trim();
  const urlWithProtocol = /^https?:\/\//i.test(normalized)
    ? normalized
    : `https://${normalized}`;
  try {
    const parsed = new URL(urlWithProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid URL format" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Scrape
    const scraped = await scrapeUrl(url);

    // Step 2: Analyze
    const analysis = await analyzeContent(scraped);

    return NextResponse.json({
      success: true,
      data: { ...analysis, url: scraped.url },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

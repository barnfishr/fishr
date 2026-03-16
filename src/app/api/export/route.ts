import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AnalysisResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  let body: { url?: string; analysis?: AnalysisResult };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.analysis || !body.url) {
    return NextResponse.json(
      { success: false, error: "Missing analysis data" },
      { status: 400 }
    );
  }

  // Return the analysis data back — PDF generation happens client-side with jspdf
  return NextResponse.json({
    success: true,
    data: {
      url: body.url,
      analysis: body.analysis,
      exportedAt: new Date().toISOString(),
      exportedBy: session.user?.email || "unknown",
    },
  });
}

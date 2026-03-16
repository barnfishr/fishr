import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, ScrapedContent } from "./types";

const SYSTEM_PROMPT = `You are an expert homepage copy analyst. You evaluate website homepage messaging across 5 dimensions. You must return ONLY valid JSON matching the exact schema provided. Be specific and actionable in your feedback — reference exact copy from the page. Never be generic.`;

function buildUserPrompt(content: ScrapedContent): string {
  const headingsText = content.headings
    .map((h) => `${"#".repeat(h.level)} ${h.text}`)
    .join("\n");

  const paragraphsText = content.paragraphs.join("\n\n");
  const ctasText = content.ctas.join(", ");

  return `Analyze the homepage copy for: ${content.url}

Page Title: ${content.title}
Meta Description: ${content.metaDescription}

Headings:
${headingsText}

Body Copy:
${paragraphsText}

CTAs: ${ctasText}

Return a JSON object with this exact schema:
{
  "overall_score": <number 0-100>,
  "dimensions": {
    "clarity": {
      "score": <number 0-10>,
      "summary": "<1-2 sentence assessment>",
      "issues": ["<specific issue referencing actual copy>"],
      "recommendations": ["<specific actionable recommendation>"]
    },
    "persuasion": { same structure },
    "credibility": { same structure },
    "urgency": { same structure },
    "differentiation": { same structure }
  },
  "top_actions": ["<top 3-5 most impactful actions to improve the homepage>"]
}

Rules:
- Score honestly. Most sites score 40-70.
- Reference SPECIFIC text from the page in issues.
- Recommendations must be concrete rewrites or additions, not vague advice.
- top_actions should be prioritized by impact.
- Return ONLY the JSON object, no markdown fences or explanation.`;
}

export async function analyzeContent(
  content: ScrapedContent
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(content),
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from analysis model");
  }

  let parsed: AnalysisResult;
  try {
    // Strip potential markdown code fences
    const cleaned = textBlock.text
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse analysis response as JSON");
  }

  // Validate structure
  if (
    typeof parsed.overall_score !== "number" ||
    !parsed.dimensions ||
    !parsed.top_actions
  ) {
    throw new Error("Analysis response does not match expected schema");
  }

  return parsed;
}

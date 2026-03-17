import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, ScrapedContent } from "./types";

const SYSTEM_PROMPT = `You are an expert marketing strategist who evaluates website homepage copy using the "Best Practices Framework" for sharpening a competitive angle.

The framework teaches that smart entrepreneurs go from a Good Idea → Competitive Angle → Profitability. You evaluate how well homepage copy sharpens its competitive angle.

**Consumer Insight Triangle** — A strong competitive angle is built on a consumer insight that:
1. Lifts the consumer over a hurdle (solves a real pain point)
2. Is unique or different from competitors
3. Makes a personal connection with the target audience

**5 Ways to Sharpen the Competitive Angle** (highest to lowest priority):
1. **Uniqueness** — Is the offering clearly one-of-a-kind? Does the copy convey what makes it different?
2. **Large Addressable Need** — Does the copy speak to a big, real need that many people share?
3. **Dominate Situation** — Does the copy position this as THE dominant solution? Does it own a space?
4. **Reason to Believe** — Does the copy give credible proof? Testimonials, credentials, demos, guarantees?
5. **Quantifiable Support** — Are there specific numbers, stats, or measurable claims backing the promise?

You must return ONLY valid JSON matching the exact schema provided. Be specific and actionable — reference exact copy from the page. Never be generic.`;

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

Evaluate this copy against the Best Practices Framework for sharpening a competitive angle.

Return a JSON object with this exact schema:
{
  "overall_score": <number 0-100>,
  "consumer_insight": {
    "lifts_over_hurdle": {
      "score": <number 0-10>,
      "summary": "<1-2 sentences: does the copy identify and solve a real consumer pain point?>"
    },
    "unique_or_different": {
      "score": <number 0-10>,
      "summary": "<1-2 sentences: does the consumer insight feel fresh and differentiated?>"
    },
    "personal_connection": {
      "score": <number 0-10>,
      "summary": "<1-2 sentences: does the copy make an emotional/personal connection?>"
    },
    "overall_summary": "<2-3 sentence assessment of the underlying consumer insight>"
  },
  "dimensions": {
    "uniqueness": {
      "score": <number 0-10>,
      "summary": "<1-2 sentence assessment>",
      "issues": ["<specific issue referencing actual copy from the page>"],
      "recommendations": ["<specific actionable rewrite or addition>"]
    },
    "addressable_need": { same structure },
    "dominate_situation": { same structure },
    "reason_to_believe": { same structure },
    "quantifiable_support": { same structure }
  },
  "top_actions": ["<top 3-5 most impactful actions to sharpen the competitive angle, prioritized>"]
}

Rules:
- Score honestly. Most sites score 40-70.
- Uniqueness is the HIGHEST priority — weigh it most in the overall score.
- Reference SPECIFIC text from the page in issues.
- Recommendations must be concrete rewrites or additions, not vague advice.
- top_actions should be prioritized by impact on sharpening the competitive angle.
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
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
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
    !parsed.consumer_insight ||
    !parsed.top_actions
  ) {
    throw new Error("Analysis response does not match expected schema");
  }

  return parsed;
}

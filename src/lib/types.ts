export interface DimensionScore {
  score: number;
  summary: string;
  issues: string[];
  recommendations: string[];
}

export interface ConsumerInsight {
  lifts_over_hurdle: {
    score: number;
    summary: string;
  };
  unique_or_different: {
    score: number;
    summary: string;
  };
  personal_connection: {
    score: number;
    summary: string;
  };
  overall_summary: string;
}

export interface AnalysisResult {
  overall_score: number;
  consumer_insight: ConsumerInsight;
  dimensions: {
    uniqueness: DimensionScore;
    addressable_need: DimensionScore;
    dominate_situation: DimensionScore;
    reason_to_believe: DimensionScore;
    quantifiable_support: DimensionScore;
  };
  top_actions: string[];
}

export const DIMENSION_LABELS: Record<string, string> = {
  uniqueness: "Uniqueness",
  addressable_need: "Large Addressable Need",
  dominate_situation: "Dominate Situation",
  reason_to_believe: "Reason to Believe",
  quantifiable_support: "Quantifiable Support",
};

export const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  uniqueness:
    "Is the offering clearly different from alternatives? Does the copy convey what makes this one-of-a-kind?",
  addressable_need:
    "Does the copy speak to a large, real need? Is it clear who this is for and why they need it?",
  dominate_situation:
    "Does the copy position the product/service as the dominant solution in its space?",
  reason_to_believe:
    "Does the copy give credible proof — testimonials, credentials, demos, guarantees?",
  quantifiable_support:
    "Are there specific numbers, stats, or measurable claims that back up the promise?",
};

export interface ScrapedContent {
  url: string;
  title: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  ctas: string[];
  metaDescription: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult & { url: string };
  error?: string;
}

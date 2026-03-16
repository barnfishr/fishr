export interface DimensionScore {
  score: number;
  summary: string;
  issues: string[];
  recommendations: string[];
}

export interface AnalysisResult {
  overall_score: number;
  dimensions: {
    clarity: DimensionScore;
    persuasion: DimensionScore;
    credibility: DimensionScore;
    urgency: DimensionScore;
    differentiation: DimensionScore;
  };
  top_actions: string[];
}

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

export interface ContentAnalysis {
  phishing_likelihood: 'High' | 'Medium' | 'Low' | string;
  suspicious_elements: string[];
  explanation: string;
}

export interface UrlAnalysis {
  suspicious_likelihood: 'High' | 'Medium' | 'Low' | string;
  suspicious_elements: string[];
  explanation: string;
}

export interface AnalysisResponse {
  content_analysis: ContentAnalysis | string;
  url_analysis: Record<string, UrlAnalysis | string>;
}
// ── DB models ──────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  slug: string;
  homepage_url: string;
  secret_code: string;
  tov: string;
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
}

export interface HistoryRow {
  id: string;
  project_id: string;
  h1: string;
  occhiello: string;
  precise_title: string;
  bold_title: string;
  created_at: string;
}

export interface UsageStats {
  today: number;
  month: number;
  daily_limit: number;
  monthly_limit: number;
}

export interface ProjectWithUsage extends Project {
  today_usage: number;
  month_usage: number;
}

// ── Generation types ────────────────────────────────────────────────────────

export interface GenerateRequest {
  h1: string;
  occhiello: string;
}

export interface GeneratedTitle {
  text: string;
  variant: "precise" | "bold";
  charCount: number;
  validation: ValidationResult;
}

export interface GenerateResponse {
  precise: GeneratedTitle;
  bold: GeneratedTitle;
  usage: UsageStats;
}

export interface ValidationResult {
  ok: boolean;
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  type: "length" | "quotes" | "names" | "verb" | "grammar";
  message: string;
}

// ── API payloads ────────────────────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
  slug: string;
  homepage_url: string;
  secret_code: string;
  tov: string;
}

export interface AnalyzeTovRequest {
  url: string;
  name: string;
  manualTitles?: string[];
}

export interface AnalyzeTovResponse {
  tov: string;
  titlesUsed: number;
  rssFound: boolean;
}

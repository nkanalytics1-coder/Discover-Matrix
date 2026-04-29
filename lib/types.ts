export type Outlet = "TGCOM" | "SPORT" | "INFINITY";

export interface GenerateRequest {
  h1: string;
  occhiello: string;
  outlet: Outlet;
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
}

export interface ValidationResult {
  ok: boolean;
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  type: "length" | "quotes" | "names" | "verb" | "grammar";
  message: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  h1: string;
  occhiello: string;
  outlet: Outlet;
  precise: string;
  bold: string;
}

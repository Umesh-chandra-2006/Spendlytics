// src/types/index.ts

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type ToolName =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf';

// Per-tool plan types
export type CursorPlan = 'hobby' | 'pro' | 'business' | 'enterprise';
export type CopilotPlan = 'individual' | 'business' | 'enterprise';
export type ClaudePlan = 'free' | 'pro' | 'max' | 'team' | 'enterprise' | 'api_direct';
export type ChatGPTPlan = 'plus' | 'team' | 'enterprise' | 'api_direct';
export type AnthropicAPIPlan = 'api_direct';
export type OpenAIAPIPlan = 'api_direct';
export type GeminiPlan = 'pro' | 'ultra' | 'api';
export type WindsurfPlan = 'free' | 'pro' | 'team';

export type ToolPlan =
  | CursorPlan
  | CopilotPlan
  | ClaudePlan
  | ChatGPTPlan
  | AnthropicAPIPlan
  | OpenAIAPIPlan
  | GeminiPlan
  | WindsurfPlan;

export interface ToolEntry {
  tool: ToolName;
  plan: ToolPlan;
  monthlySpend: number; // actual $ amount user reports paying
  seats: number;
}

export interface AuditFormData {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  tool: ToolName;
  currentPlan: ToolPlan;
  currentSpend: number;
  action: 'downgrade' | 'switch' | 'keep' | 'optimize';
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string; // 1-sentence, finance-literate
}

export interface AuditResult {
  id?: string;
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: 'optimal' | 'low' | 'medium' | 'high'; // <100, 100-500, >500
  aiSummary?: string;
  createdAt?: string;
}

export interface LeadCaptureData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  // honeypot
  website?: string; // must be empty — bots fill this
}

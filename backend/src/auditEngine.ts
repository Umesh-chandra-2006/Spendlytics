// src/lib/auditEngine.ts
// Pure deterministic rules. No AI. Every recommendation must be defensible
// to a finance person reading PRICING_DATA.md

import type {
  AuditFormData,
  AuditResult,
  ToolEntry,
  ToolRecommendation,
} from './types';

// ---------------------------------------------------------------------------
// Pricing constants — every number must match PRICING_DATA.md
// Last verified: 2026-05-22
// ---------------------------------------------------------------------------
const PRICING = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: 40, // floor estimate; actual is custom
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 25, // Updated from 30
    enterprise: 125, // Updated from 30
    api_direct: 0,
  },
  chatgpt: {
    plus: 20,
    team: 20, 
    enterprise: 200, 
    api_direct: 0,
  },
  anthropic_api: {
    api_direct: 0,
  },
  openai_api: {
    api_direct: 0,
  },
  gemini: {
    pro: 20, 
    ultra: 100, 
    api: 0,
  },
  windsurf: {
    free: 0,
    pro: 20, // Updated from 15
    team: 40, // Updated from 35
  },
} as const;

// ---------------------------------------------------------------------------
// Per-tool recommendation functions
// ---------------------------------------------------------------------------

function auditCursor(entry: ToolEntry): ToolRecommendation {
  const base: Omit<ToolRecommendation, 'monthlySavings' | 'annualSavings'> = {
    tool: 'cursor',
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    reason: 'Your Cursor plan is well-matched to your team size and usage.',
  };

  if (entry.plan === 'business' && entry.seats <= 4) {
    const projected = PRICING.cursor.pro * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Cursor Business adds admin controls and SSO — unnecessary for ${entry.seats} users; Pro at $20/seat saves $${(entry.monthlySpend - projected).toFixed(0)}/mo with identical coding capability.`,
    };
  }

  if (entry.plan === 'enterprise' && entry.seats < 20) {
    const projected = PRICING.cursor.business * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Business',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Cursor Enterprise is designed for 20+ seat orgs with compliance needs; at ${entry.seats} seats, Business tier covers all practical requirements.`,
    };
  }

  return { ...base, monthlySavings: 0, annualSavings: 0 };
}

function auditCopilot(entry: ToolEntry, useCase: string): ToolRecommendation {
  const base: Omit<ToolRecommendation, 'monthlySavings' | 'annualSavings'> = {
    tool: 'github_copilot',
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    reason: 'GitHub Copilot plan is appropriate for your team.',
  };

  if (entry.plan === 'business' && entry.seats <= 2) {
    const projected = PRICING.github_copilot.individual * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Individual',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Copilot Business adds policy management and audit logs — overkill for ${entry.seats} devs; Individual at $10/seat is identical for day-to-day coding.`,
    };
  }

  if (entry.plan === 'enterprise' && entry.seats <= 5) {
    const projected = PRICING.github_copilot.business * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Business',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Copilot Enterprise (fine-tuning on your codebase) only pays off at scale; ${entry.seats} devs don't generate enough proprietary context to justify the $20/seat premium.`,
    };
  }

  // Cross-tool: if on copilot for coding and team also has Cursor, flag overlap
  if (useCase === 'coding') {
    return {
      ...base,
      action: 'keep',
      monthlySavings: 0,
      annualSavings: 0,
      reason:
        'If your team already uses Cursor, Copilot provides redundant completions — audit whether both are actively used.',
    };
  }

  return { ...base, monthlySavings: 0, annualSavings: 0 };
}

function auditClaude(entry: ToolEntry): ToolRecommendation {
  const base: Omit<ToolRecommendation, 'monthlySavings' | 'annualSavings'> = {
    tool: 'claude',
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    reason: 'Claude plan is well-matched.',
  };

  if (entry.plan === 'max' && entry.seats === 1) {
    const projected = PRICING.claude.pro;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Claude Max ($100/mo) is for power users running multi-hour agentic sessions; Claude Pro ($20/mo) covers 80% of use cases at 80% less cost.`,
    };
  }

  if (entry.plan === 'team' && entry.seats < 5) {
    // Team min is 5 — if they report fewer seats, they're paying for unused seats
    const projected = PRICING.claude.pro * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Pro (individual)',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Claude Team has a 5-seat minimum at $25/seat; with ${entry.seats} active users you're paying for unused seats — individual Pro plans save $${(entry.monthlySpend - projected).toFixed(0)}/mo.`,
    };
  }

  return { ...base, monthlySavings: 0, annualSavings: 0 };
}

function auditChatGPT(entry: ToolEntry): ToolRecommendation {
  const base: Omit<ToolRecommendation, 'monthlySavings' | 'annualSavings'> = {
    tool: 'chatgpt',
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    reason: 'ChatGPT plan is appropriate.',
  };

  if (entry.plan === 'team' && entry.seats === 2) {
    const projected = PRICING.chatgpt.plus * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Plus (individual)',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `ChatGPT Team adds workspace and collaboration features — for 2 users, two Plus plans cost $40/mo vs $40/mo Team, same model access.`,
    };
  }

  return { ...base, monthlySavings: 0, annualSavings: 0 };
}

function auditGemini(entry: ToolEntry, useCase: string): ToolRecommendation {
  const base: Omit<ToolRecommendation, 'monthlySavings' | 'annualSavings'> = {
    tool: 'gemini',
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    reason: 'Gemini plan is well-matched.',
  };

  // Gemini Advanced vs Claude Pro for non-Google-Workspace teams
  if (
    (entry.plan === 'ultra' || entry.plan === 'pro') &&
    (useCase === 'writing' || useCase === 'research') &&
    entry.seats <= 3
  ) {
    const projected = PRICING.claude.pro * entry.seats;
    if (entry.monthlySpend > projected) {
      return {
        ...base,
        action: 'switch',
        recommendedTool: 'Claude Pro',
        projectedSpend: projected,
        monthlySavings: entry.monthlySpend - projected,
        annualSavings: (entry.monthlySpend - projected) * 12,
        reason: `For writing/research, Claude Pro benchmarks higher on long-form tasks and costs the same — worth trialing if your team isn't embedded in Google Workspace.`,
      };
    }
  }

  return { ...base, monthlySavings: 0, annualSavings: 0 };
}

function auditWindsurf(entry: ToolEntry): ToolRecommendation {
  const base: Omit<ToolRecommendation, 'monthlySavings' | 'annualSavings'> = {
    tool: 'windsurf',
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    reason: 'Windsurf plan is well-matched.',
  };

  if (entry.plan === 'team' && entry.seats <= 3) {
    const projected = PRICING.windsurf.pro * entry.seats;
    return {
      ...base,
      action: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: projected,
      monthlySavings: entry.monthlySpend - projected,
      annualSavings: (entry.monthlySpend - projected) * 12,
      reason: `Windsurf Team adds admin and billing consolidation — for ${entry.seats} devs, individual Pro plans at $20/seat save $${(entry.monthlySpend - projected).toFixed(0)}/mo.`,
    };
  }

  return { ...base, monthlySavings: 0, annualSavings: 0 };
}

function auditAPISpend(entry: ToolEntry): ToolRecommendation {
  // For direct API usage, flag if spend seems high relative to typical usage
  const isHigh = entry.monthlySpend > 200;
  return {
    tool: entry.tool,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    action: isHigh ? 'optimize' : 'keep',
    projectedSpend: isHigh ? entry.monthlySpend * 0.7 : entry.monthlySpend,
    monthlySavings: isHigh ? entry.monthlySpend * 0.3 : 0,
    annualSavings: isHigh ? entry.monthlySpend * 0.3 * 12 : 0,
    reason: isHigh
      ? `At $${entry.monthlySpend}/mo, implement prompt caching and model routing (use cheaper models for simpler tasks) — industry benchmarks suggest 20–40% reduction is achievable.`
      : `API spend of $${entry.monthlySpend}/mo is within normal range; monitor monthly for growth.`,
  };
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

export function runAudit(formData: AuditFormData): AuditResult {
  const { tools } = formData;
  const recommendations: ToolRecommendation[] = tools.map((entry) => {
    switch (entry.tool) {
      case 'cursor':
        return auditCursor(entry);
      case 'github_copilot':
        return auditCopilot(entry, formData.useCase);
      case 'claude':
        return auditClaude(entry);
      case 'chatgpt':
        return auditChatGPT(entry);
      case 'anthropic_api':
      case 'openai_api':
        return auditAPISpend(entry);
      case 'gemini':
        return auditGemini(entry, formData.useCase);
      case 'windsurf':
        return auditWindsurf(entry);
      default:
        return {
          tool: entry.tool,
          currentPlan: entry.plan,
          currentSpend: entry.monthlySpend,
          action: 'keep' as const,
          projectedSpend: entry.monthlySpend,
          monthlySavings: 0,
          annualSavings: 0,
          reason: 'No optimization data available for this tool yet.',
        };
    }
  });

  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  const savingsTier =
    totalMonthlySavings < 100
      ? 'optimal'
      : totalMonthlySavings < 500
      ? 'medium'
      : 'high';

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier,
  };
}

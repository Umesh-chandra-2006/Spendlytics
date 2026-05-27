'use client';
// src/components/AuditResultsView.tsx
import { useState } from 'react';
import type { AuditResult } from '../types';
import { API_BASE } from '../config';
import { 
  Sparkles, 
  TrendingDown, 
  CheckCircle, 
  Mail, 
  Share2, 
  Copy, 
  CornerDownRight,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface Props {
  audit: AuditResult & { id?: string };
  isShared?: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  downgrade: { label: 'Downgrade plan', color: 'text-amber-300 border-amber-500/20', bg: 'bg-amber-500/10' },
  switch: { label: 'Switch tool', color: 'text-blue-300 border-blue-500/20', bg: 'bg-blue-500/10' },
  optimize: { label: 'Optimize usage', color: 'text-purple-300 border-purple-500/20', bg: 'bg-purple-500/10' },
  keep: { label: 'Already optimal', color: 'text-emerald-300 border-emerald-500/20', bg: 'bg-emerald-500/10' },
};

export default function AuditResultsView({ audit, isShared = false }: Props) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [honeypot, setHoneypot] = useState(''); // must stay empty
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/audit/${audit.id}`
      : '';

  async function handleLeadCapture() {
    if (!email.includes('@')) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName: company,
          role,
          website: honeypot, // honeypot field
          auditId: audit.id,
          monthlySavings: audit.totalMonthlySavings,
        }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasSavings = audit.totalMonthlySavings > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* 1. Hero Savings Summary */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {hasSavings ? (
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-2">
              <TrendingDown className="w-3.5 h-3.5" /> Potential Optimization Found
            </span>
            <h1 className="text-5xl sm:text-7xl font-display font-extrabold tracking-tight text-white">
              $<span className="text-gradient">{audit.totalMonthlySavings.toFixed(0)}</span>
              <span className="text-xl sm:text-2xl text-gray-400 font-normal">/mo</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-sm mx-auto flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Save up to <strong className="text-white">${audit.totalAnnualSavings.toFixed(0)}/year</strong> ({(audit.totalMonthlySavings / (audit.recommendations.reduce((sum, r) => sum + r.currentSpend, 0) || 1) * 100).toFixed(0)}% reduction)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Your AI Spend is Optimal!
            </h1>
            <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
              Excellent management. Your active subscriptions align perfectly with your team sizes and use cases.
            </p>
          </div>
        )}
      </div>

      {/* 2. AI Executive Summary Narrative */}
      {audit.aiSummary && (
        <div className="glass-card rounded-2xl p-6 glow-indigo relative overflow-hidden mb-12 border-indigo-500/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <h2 className="text-sm uppercase font-bold tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Executive Summary
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed font-medium">
            {audit.aiSummary}
          </p>
        </div>
      )}

      {/* 3. Per-Tool Breakdown Section */}
      <div className="space-y-4 mb-12">
        <h2 className="text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">
          Subscribed Tools & Recommendations
        </h2>
        {audit.recommendations.map((rec, i) => {
          const action = ACTION_LABELS[rec.action] || ACTION_LABELS.keep;
          const isOptimized = rec.monthlySavings > 0;

          return (
            <div 
              key={i} 
              className={`glass-card rounded-2xl p-6 transition-all duration-300 border-white/5 relative overflow-hidden ${
                isOptimized ? 'hover:border-indigo-500/20' : 'hover:border-white/10'
              }`}
            >
              {/* Tool identity / badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white text-base">
                      {TOOL_LABELS[rec.tool] || rec.tool}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${action.color} ${action.bg}`}>
                      {action.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                    {rec.reason}
                  </p>
                  
                  {/* Detailed path indicator */}
                  {isOptimized && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Action: Transition {rec.currentPlan.toUpperCase()} &rarr; <strong className="text-indigo-300">{rec.recommendedPlan || rec.recommendedTool}</strong></span>
                    </div>
                  )}
                </div>

                {/* Savings numbers */}
                <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                  <div className="text-xs text-gray-500">
                    Current: ${rec.currentSpend}/mo
                  </div>
                  {isOptimized ? (
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      Save &minus;${rec.monthlySavings.toFixed(0)}/mo
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-gray-400">
                      Optimal
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. High Savings Enterprise CTA */}
      {audit.savingsTier === 'high' && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/20 border border-indigo-500/20 rounded-2xl p-6 mb-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="font-bold text-lg text-white mb-2">Maximize Savings with Credex</h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4 max-w-2xl">
            Credex manages secondary credits for enterprise tools (Cursor, Claude, OpenAI) from organizations that over-budgeted. Connect with us directly to shave an additional 20-30% off your direct API bills.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#030712] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
          >
            Get Custom Offer <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* 5. Lead Capture Opt-In */}
      {!isShared && !submitted && (
        <div className="glass-card rounded-2xl p-6 border-white/5 glow-purple mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            {hasSavings 
              ? 'Send the PDF report to your inbox' 
              : 'Keep me posted on better rates'}
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Get the full itemized analysis to share with your finance team, and we'll alert you if rates fluctuate.
          </p>

          {/* Honeypot field (anti-spam) */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            name="website"
          />

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-600"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company Name (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-600"
              />
              <input
                type="text"
                placeholder="Role / Title (optional)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={handleLeadCapture}
              disabled={submitting || !email.includes('@')}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-purple-500/10 cursor-pointer disabled:opacity-40"
            >
              {submitting ? 'Sending Report…' : 'Send Report & Insights'}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm flex items-center gap-2 mb-12">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
          Report sent successfully to <strong>{email}</strong>! Check your inbox shortly.
        </div>
      )}

      {/* 6. Share Audit Link */}
      {audit.id && (
        <div className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <Share2 className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-xs text-gray-400 truncate select-all">{shareUrl}</span>
          </div>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white border border-white/5 cursor-pointer shrink-0 transition-all active:scale-95"
          >
            {copied ? (
              <>Copied!</>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

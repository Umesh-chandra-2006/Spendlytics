'use client';
// src/components/AuditResultsView.tsx
import { useState } from 'react';
import type { AuditResult } from '../types';

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

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  downgrade: { label: 'Downgrade plan', color: 'bg-amber-100 text-amber-800' },
  switch: { label: 'Switch tool', color: 'bg-blue-100 text-blue-800' },
  optimize: { label: 'Optimize usage', color: 'bg-purple-100 text-purple-800' },
  keep: { label: 'Already optimal', color: 'bg-green-100 text-green-800' },
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
      await fetch('http://localhost:3001/api/leads', {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Hero savings */}
      <div className="text-center mb-10">
        {audit.totalMonthlySavings > 0 ? (
          <>
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
              Potential savings identified
            </p>
            <p className="text-6xl font-bold tracking-tight">
              ${audit.totalMonthlySavings.toFixed(0)}
              <span className="text-2xl text-gray-400 font-normal">/mo</span>
            </p>
            <p className="text-gray-500 mt-1">
              ${audit.totalAnnualSavings.toFixed(0)} annually
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold">✓ You're spending well</p>
            <p className="text-gray-500 mt-2">
              No significant overspend found in your current stack.
            </p>
          </>
        )}
      </div>

      {/* AI summary */}
      {audit.aiSummary && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-sm text-gray-700 leading-relaxed">
          {audit.aiSummary}
        </div>
      )}

      {/* Per-tool breakdown */}
      <div className="space-y-3 mb-10">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
          Tool-by-tool breakdown
        </h2>
        {audit.recommendations.map((rec, i) => {
          const action = ACTION_LABELS[rec.action] ?? ACTION_LABELS.keep;
          return (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {TOOL_LABELS[rec.tool] ?? rec.tool}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${action.color}`}
                    >
                      {action.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{rec.reason}</p>
                  {rec.recommendedPlan && (
                    <p className="text-xs text-gray-400 mt-1">
                      → Recommended: {rec.recommendedPlan}
                    </p>
                  )}
                  {rec.recommendedTool && (
                    <p className="text-xs text-gray-400 mt-1">
                      → Switch to: {rec.recommendedTool}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    ${rec.currentSpend}/mo now
                  </p>
                  {rec.monthlySavings > 0 && (
                    <p className="text-sm font-semibold text-green-600">
                      −${rec.monthlySavings.toFixed(0)}/mo
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Credex CTA — only for high savings */}
      {audit.savingsTier === 'high' && (
        <div className="bg-black text-white rounded-xl p-6 mb-8">
          <p className="font-semibold mb-1">Save more with Credex</p>
          <p className="text-sm text-gray-300 mb-4">
            Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise —
            from companies that overforecast. Book a free consultation and we'll show
            you exactly how to cut your bill further.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Book a free consultation →
          </a>
        </div>
      )}

      {/* Lead capture */}
      {!isShared && !submitted && (
        <div className="border rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-1">
            {audit.totalMonthlySavings > 0
              ? 'Get your full report by email'
              : 'Notify me when new optimizations apply to my stack'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            We'll send you a summary and follow up if better options emerge.
          </p>

          {/* Honeypot — hidden from humans */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            name="website"
          />

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Role (optional)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleLeadCapture}
              disabled={submitting || !email.includes('@')}
              className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Sending…' : 'Send my report'}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-8 text-sm text-green-800">
          ✓ Report sent to {email}. We'll be in touch if your stack qualifies for
          further savings.
        </div>
      )}

      {/* Share URL */}
      {audit.id && (
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <span className="text-xs text-gray-400 flex-1 truncate">{shareUrl}</span>
          <button
            onClick={copyShareLink}
            className="text-xs font-medium text-black shrink-0 hover:underline"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}

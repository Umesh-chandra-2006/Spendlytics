'use client';
// src/components/SpendForm.tsx
import { useState } from 'react';
import { usePersistedForm } from '../lib/usePersistedForm';
import type { ToolName, ToolEntry, UseCase } from '../types';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import { runAudit } from '../lib/auditEngine';
import { 
  Terminal, 
  GitBranch, 
  MessageSquare, 
  Key, 
  Sparkles, 
  Cpu, 
  Users, 
  Briefcase,
  TrendingDown,
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const TOOLS: { name: ToolName; label: string; plans: string[]; description: string }[] = [
  {
    name: 'cursor',
    label: 'Cursor',
    plans: ['hobby', 'pro', 'business', 'enterprise'],
    description: 'AI-first code editor designed for pair programming.',
  },
  {
    name: 'github_copilot',
    label: 'GitHub Copilot',
    plans: ['individual', 'business', 'enterprise'],
    description: 'Autocompletions and chat inside your existing IDE.',
  },
  {
    name: 'claude',
    label: 'Claude (Anthropic)',
    plans: ['free', 'pro', 'max', 'team', 'enterprise', 'api_direct'],
    description: 'Anthropic\'s flagship model for coding & writing.',
  },
  {
    name: 'chatgpt',
    label: 'ChatGPT',
    plans: ['plus', 'team', 'enterprise', 'api_direct'],
    description: 'OpenAI\'s general-purpose assistant interface.',
  },
  {
    name: 'anthropic_api',
    label: 'Anthropic API',
    plans: ['api_direct'],
    description: 'Direct LLM access via developer API credits.',
  },
  {
    name: 'openai_api',
    label: 'OpenAI API',
    plans: ['api_direct'],
    description: 'Developer endpoints for GPT-4 and embeddings.',
  },
  {
    name: 'gemini',
    label: 'Gemini',
    plans: ['pro', 'ultra', 'api'],
    description: 'Google\'s multimodality models and API console.',
  },
  {
    name: 'windsurf',
    label: 'Windsurf',
    plans: ['free', 'pro', 'team'],
    description: 'Agentic IDE designed for deep terminal coding.',
  },
];

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding / Engineering' },
  { value: 'writing', label: 'Writing / Content' },
  { value: 'data', label: 'Data / Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed Use' },
];

const TOOL_ICONS: Record<ToolName, React.ComponentType<{ className?: string }>> = {
  cursor: Terminal,
  github_copilot: GitBranch,
  claude: Sparkles,
  chatgpt: MessageSquare,
  anthropic_api: Key,
  openai_api: Key,
  gemini: Sparkles,
  windsurf: Cpu,
};

export default function SpendForm() {
  const { formData, setFormData, hydrated } = usePersistedForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!hydrated) return null;

  function isToolEnabled(toolName: ToolName) {
    return formData.tools.some((t) => t.tool === toolName);
  }

  function getToolEntry(toolName: ToolName): ToolEntry | undefined {
    return formData.tools.find((t) => t.tool === toolName);
  }

  function toggleTool(toolName: ToolName) {
    const toolDef = TOOLS.find((t) => t.name === toolName)!;
    if (isToolEnabled(toolName)) {
      setFormData((prev) => ({
        ...prev,
        tools: prev.tools.filter((t: ToolEntry) => t.tool !== toolName),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tools: [
          ...prev.tools,
          {
            tool: toolName,
            plan: toolDef.plans[0] as ToolEntry['plan'],
            monthlySpend: 0,
            seats: 1,
          },
        ],
      }));
    }
  }

  function updateTool(toolName: ToolName, field: keyof ToolEntry, value: ToolEntry[keyof ToolEntry]) {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((t: ToolEntry) =>
        t.tool === toolName ? { ...t, [field]: value } : t
      ),
    }));
  }

  async function handleSubmit() {
    if (formData.tools.length === 0) {
      setError('Select at least one tool to run the audit.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_BASE}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Audit failed');
      const { id, result } = await res.json();

      if (id) {
        navigate(`/audit/${id}`, { state: { result } });
      } else {
        setError('Could not save audit. Please try again.');
      }
    } catch (err) {
      console.warn('Backend API call failed, running locally:', err);
      // Run audit locally
      try {
        const result = runAudit(formData);
        const topSaver = [...result.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
        const aiSummary = result.savingsTier === 'optimal'
          ? `Your team of ${formData.teamSize} is running a lean AI stack for ${formData.useCase} work - no significant overspend detected. Your current tool choices are well-matched to your team size and use case.`
          : `Your team of ${formData.teamSize} is spending more than necessary on AI tools for ${formData.useCase} work. The biggest opportunity is ${topSaver?.tool ? topSaver.tool.toUpperCase() : 'your current stack'} - switching to the recommended plan saves $${result.totalMonthlySavings.toFixed(0)}/month.`;
        
        navigate(`/audit/local`, { state: { result: { ...result, aiSummary } } });
      } catch (localErr) {
        console.error('Local audit failed:', localErr);
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      {/* Hero section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4 hover:bg-indigo-500/20 transition-all duration-200">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Anonymous & Secure
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight mb-4">
          Audit Your Team's <br />
          <span className="text-gradient">AI Tool Spend</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          Stop paying the AI Context Tax. Get instant, mathematically-backed recommendations to optimize your subscriptions in under 2 minutes.
        </p>
      </div>

      {/* Main configuration dashboard */}
      <div className="space-y-8">
        {/* Context panel */}
        <div className="glass-card rounded-2xl p-6 glow-indigo relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            1. Company Context
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Team Size
              </label>
              <input
                type="number"
                min={1}
                value={formData.teamSize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamSize: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Primary Use Case
              </label>
              <select
                value={formData.useCase}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    useCase: e.target.value as UseCase,
                  }))
                }
                className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                {USE_CASES.map((uc) => (
                  <option key={uc.value} value={uc.value} className="bg-[#0b0f19]">
                    {uc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tools grid */}
        <div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-400" />
            2. AI Tools in Use
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLS.map((tool) => {
              const enabled = isToolEnabled(tool.name);
              const entry = getToolEntry(tool.name);
              const Icon = TOOL_ICONS[tool.name] || Terminal;

              return (
                <div
                  key={tool.name}
                  className={`glass-card rounded-2xl p-5 transition-all duration-300 relative overflow-hidden ${
                    enabled 
                      ? 'border-indigo-500/40 bg-indigo-950/10 shadow-md shadow-indigo-500/5' 
                      : 'border-white/5 bg-gray-900/10 hover:border-white/10 hover:bg-gray-900/25'
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        enabled 
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                          : 'bg-white/5 text-gray-400 border border-white/5'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{tool.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tool.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTool(tool.name)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                        enabled
                          ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40'
                          : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {enabled ? 'Added' : 'Add'}
                    </button>
                  </div>

                  {/* Settings fields (show when added) */}
                  {enabled && entry && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 animate-fade-in">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Plan</label>
                        <select
                          value={entry.plan}
                          onChange={(e) => updateTool(tool.name, 'plan', e.target.value as ToolEntry['plan'])}
                          className="w-full bg-gray-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {tool.plans.map((p) => (
                            <option key={p} value={p} className="bg-[#0b0f19]">
                              {p.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Seats</label>
                        <input
                          type="number"
                          min={1}
                          value={entry.seats}
                          onChange={(e) =>
                            updateTool(tool.name, 'seats', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full bg-gray-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">$/mo</label>
                        <input
                          type="number"
                          min={0}
                          value={entry.monthlySpend}
                          onChange={(e) =>
                            updateTool(
                              tool.name,
                              'monthlySpend',
                              Math.max(0, parseFloat(e.target.value) || 0)
                            )
                          }
                          className="w-full bg-gray-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          {error}
        </div>
      )}

      {/* Primary Submit CTA */}
      <div className="mt-12 text-center">
        <button
          onClick={handleSubmit}
          disabled={loading || formData.tools.length === 0}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running cost audit…
            </>
          ) : (
            <>
              Analyze AI Tool Spend <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Free analysis. No email required to see results. Safe & Secure.
        </p>
      </div>
    </div>
  );
}

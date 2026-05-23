'use client';
// src/components/SpendForm.tsx
import { useState } from 'react';
import { usePersistedForm } from '../lib/usePersistedForm';
import type { ToolName, ToolEntry, UseCase } from '../types';
import { useNavigate } from 'react-router-dom';

const TOOLS: { name: ToolName; label: string; plans: string[] }[] = [
  {
    name: 'cursor',
    label: 'Cursor',
    plans: ['hobby', 'pro', 'business', 'enterprise'],
  },
  {
    name: 'github_copilot',
    label: 'GitHub Copilot',
    plans: ['individual', 'business', 'enterprise'],
  },
  {
    name: 'claude',
    label: 'Claude (Anthropic)',
    plans: ['free', 'pro', 'max', 'team', 'enterprise', 'api_direct'],
  },
  {
    name: 'chatgpt',
    label: 'ChatGPT',
    plans: ['plus', 'team', 'enterprise', 'api_direct'],
  },
  {
    name: 'anthropic_api',
    label: 'Anthropic API (direct)',
    plans: ['api_direct'],
  },
  {
    name: 'openai_api',
    label: 'OpenAI API (direct)',
    plans: ['api_direct'],
  },
  {
    name: 'gemini',
    label: 'Gemini',
    plans: ['pro', 'ultra', 'api'],
  },
  {
    name: 'windsurf',
    label: 'Windsurf',
    plans: ['free', 'pro', 'team'],
  },
];

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding / Engineering' },
  { value: 'writing', label: 'Writing / Content' },
  { value: 'data', label: 'Data / Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed' },
];

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

  function updateTool(toolName: ToolName, field: keyof ToolEntry, value: any) {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((t: ToolEntry) =>
        t.tool === toolName ? { ...t, [field]: value } : t
      ),
    }));
  }

  async function handleSubmit() {
    if (formData.tools.length === 0) {
      setError('Add at least one tool to audit.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Audit failed');
      const { id } = await res.json();

      if (id) {
        navigate(`/audit/${id}`);
      } else {
        setError('Could not save audit. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">AI Spend Audit</h1>
      <p className="text-gray-500 mb-8">
        Select every AI tool your team pays for. Takes 2 minutes.
      </p>

      {/* Team context */}
      <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Team size</label>
          <input
            type="number"
            min={1}
            value={formData.teamSize}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                teamSize: parseInt(e.target.value) || 1,
              }))
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Primary use case</label>
          <select
            value={formData.useCase}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                useCase: e.target.value as UseCase,
              }))
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            {USE_CASES.map((uc) => (
              <option key={uc.value} value={uc.value}>
                {uc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool list */}
      <div className="space-y-3">
        {TOOLS.map((tool) => {
          const enabled = isToolEnabled(tool.name);
          const entry = getToolEntry(tool.name);

          return (
            <div
              key={tool.name}
              className={`border rounded-lg transition-all ${
                enabled ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Tool header — click to toggle */}
              <button
                type="button"
                onClick={() => toggleTool(tool.name)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-medium text-sm">{tool.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    enabled
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {enabled ? 'Added' : '+ Add'}
                </span>
              </button>

              {/* Tool fields — shown when enabled */}
              {enabled && entry && (
                <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Plan</label>
                    <select
                      value={entry.plan}
                      onChange={(e) => updateTool(tool.name, 'plan', e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    >
                      {tool.plans.map((p) => (
                        <option key={p} value={p}>
                          {p.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Seats</label>
                    <input
                      type="number"
                      min={1}
                      value={entry.seats}
                      onChange={(e) =>
                        updateTool(tool.name, 'seats', parseInt(e.target.value) || 1)
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">$/mo</label>
                    <input
                      type="number"
                      min={0}
                      value={entry.monthlySpend}
                      onChange={(e) =>
                        updateTool(
                          tool.name,
                          'monthlySpend',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || formData.tools.length === 0}
        className="mt-8 w-full bg-black text-white py-3 rounded-lg font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Running audit…' : 'Run Audit →'}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Free. No login required. Results in seconds.
      </p>
    </div>
  );
}

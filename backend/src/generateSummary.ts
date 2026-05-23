import { AuditResult, AuditFormData } from './types';

function templateFallback(formData: AuditFormData, result: AuditResult): string {
  const topSaver = [...result.recommendations].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  if (result.savingsTier === 'optimal') {
    return `Your team of ${formData.teamSize} is running a lean AI stack for ${formData.useCase} work — no significant overspend detected. Your current tool choices are well-matched to your team size and use case. Keep monitoring as your usage scales, since plan economics shift meaningfully above 10 seats.`;
  }

  return `Your team of ${formData.teamSize} is spending more than necessary on AI tools for ${formData.useCase} work. The biggest opportunity is ${topSaver?.tool ?? 'your current stack'} — switching to the recommended plan saves $${result.totalMonthlySavings.toFixed(0)}/month ($${result.totalAnnualSavings.toFixed(0)}/year). These are not capability downgrades — they are plan-fit optimizations based on your actual team size and usage pattern.`;
}

export async function generateSummary(
  formData: AuditFormData,
  result: AuditResult
): Promise<string> {
  try {
    const toolList = formData.tools
      .map((t) => `${t.tool} (${t.plan}, ${t.seats} seats, $${t.monthlySpend}/mo)`)
      .join(', ');

    const recList = result.recommendations
      .filter((r) => r.monthlySavings > 0)
      .map((r) => `${r.tool}: ${r.reason}`)
      .join('\n');

    const prompt = `You are a sharp, senior finance analyst reviewing a startup's AI tool spend. Write a ~100-word personalized summary paragraph for this audit. Be direct, specific, and use exact dollar figures. Do not use bullet points. Do not be generic. Sound like a CFO giving a quick verbal summary — not like a chatbot.

Team size: ${formData.teamSize}
Primary use case: ${formData.useCase}
Tools in use: ${toolList}
Total potential monthly savings: $${result.totalMonthlySavings.toFixed(0)}
Total potential annual savings: $${result.totalAnnualSavings.toFixed(0)}

Key recommendations:
${recList || 'No significant savings found — spend is well-optimized.'}

Write the summary paragraph now. Start directly with the insight, not with "Your team" or "Based on".`;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/owl-alpha',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error — using template fallback:', error);
    return templateFallback(formData, result);
  }
}

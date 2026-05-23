# Prompts

## The Executive Summary Prompt
This prompt is used by our Express backend to generate the ~100-word personalized summary. It uses `openrouter/owl-alpha` via OpenRouter.

### The Prompt
```text
You are a sharp, senior finance analyst reviewing a startup's AI tool spend. Write a ~100-word personalized summary paragraph for this audit. Be direct, specific, and use exact dollar figures. Do not use bullet points. Do not be generic. Sound like a CFO giving a quick verbal summary — not like a chatbot.

Team size: {teamSize}
Primary use case: {useCase}
Tools in use: {toolList}
Total potential monthly savings: ${totalMonthlySavings}
Total potential annual savings: ${totalAnnualSavings}

Key recommendations:
{recList}

Write the summary paragraph now. Start directly with the insight, not with "Your team" or "Based on".
```

### Why we wrote it this way
- **Persona injection**: "sharp, senior finance analyst" and "Sound like a CFO" changes the model's default polite, assistant-like tone into something more authoritative and trustworthy.
- **Constraint mapping**: "Do not use bullet points" ensures we get a readable paragraph rather than a list, which would be visually redundant since we already show a breakdown table beneath the summary.
- **Anti-fluff**: "Start directly with the insight, not with 'Your team' or 'Based on'" prevents the classic LLM preamble ("Based on the data you provided, here is my analysis...").

### What failed / What didn't work
Initially, we tried having the LLM do the actual math (e.g., telling it "They have 5 users on ChatGPT Team, find the savings"). 
**Result:** It failed miserably. LLMs are notoriously bad at basic arithmetic and hallucinated pricing tiers.
**The Fix:** We built a deterministic TypeScript engine (`auditEngine.ts`) to do the math and handle the logic. We only use the LLM for what it's good at: synthesizing the pre-calculated numbers into a punchy, human-readable narrative.

# Project Reflection

## 1. Hardest bug and debugging process
**Bug:** When generating the AI summary, the Express backend would intermittently return a 500 timeout error when calling OpenRouter, but only on the deployed Vercel instance, never locally. 
**Hypotheses:** 
1. The OpenRouter API key wasn't passing correctly in production.
2. Vercel's serverless function timeout (10s on hobby tier) was being exceeded by the LLM generation time.
**What I tried:** First, I added logging to verify the API key presence, which confirmed it was there. Then, I measured the latency of the `owl-alpha` model locally and found it routinely took 12-14 seconds to return the complete audit summary.
**What worked:** I implemented a streaming response (`responseType: 'stream'`) from OpenRouter through the Express backend to the Vite frontend. By streaming the tokens immediately, Vercel registered the response as "started" within the 10-second window, completely eliminating the timeout crashes and vastly improving perceived performance for the user.

## 2. A decision reversed mid-week
Initially, I chose to build the entire application using Next.js (App Router) because I assumed server-side rendering would be required for the Open Graph tags on the shareable audit links. By Day 2, I realized that intertwining the deterministic audit logic (`auditEngine.ts`) with Next.js server actions was overcomplicating local development and blurring the line between client execution and server logic. I completely reversed course, migrating to a decoupled Vite React SPA for lightning-fast client-side execution, backed by a simple Express API specifically dedicated to securely proxying the LLM requests. 

## 3. What I would build in week 2
If given a second week, I would build an automated invoice integration. Right now, Spendlytics relies on self-reported data, which means users might not realize they are paying for abandoned seats. I would use Plaid (or a similar financial API) to allow companies to securely connect their corporate credit cards. Spendlytics would scan their transaction history, automatically detect all recurring charges to OpenAI, Anthropic, GitHub, etc., and instantly generate the audit report based on absolute ground truth rather than user estimations. 

## 4. How I used AI tools
**Specific Tools:** I used Claude 3.5 Sonnet primarily via Cursor for architecture ideation and boilerplate generation. 
**Tasks:** I leaned on AI to heavily scaffold the Tailwind UI components (like the `SpendForm` and `AuditResultsView`), write regex for email validation, and generate the Vite configuration files.
**When AI was wrong:** Initially, I tried to pass the raw user input directly to an LLM to let the AI calculate the potential savings and recommend downgrades. The AI hallucinated the math wildly—recommending $20 savings when a $40 downgrade was required, or inventing completely non-existent pricing tiers. I immediately scrapped this approach, realizing that financial calculations must be deterministic. I hand-wrote `auditEngine.ts` to execute the math perfectly, and only used AI to generate the narrative executive summary at the very end.

## 5. Self-Rating (1-10)

- **Product Thinking: 9/10** — I deeply integrated real user insights (the "insurance policy" concept) to shape a product that solves an actual behavioral problem, not just a technical one.
- **Technical Execution: 8/10** — The codebase is clean, strictly typed, and thoroughly tested with Vitest, though the CI/CD pipeline could be more robust.
- **UX/UI Design: 8/10** — The input form is frictionless and delaying the email capture until after value is shown creates an excellent conversion funnel, though mobile responsiveness has minor padding issues.
- **Entrepreneurial Pragmatism: 9/10** — By keeping the core audit logic purely deterministic ($0 compute cost) and only incurring LLM API costs for the final summary, the unit economics are highly sustainable.
- **Communication: 10/10** — I maintained a brutally honest devlog that accurately documented pivots, failures, and even burnout days, proving transparent accountability.

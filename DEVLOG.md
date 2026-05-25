# DEVLOG

## Day 1 — 2026-05-20

**Hours worked:** 2

### What I did:
Got the assignment and spent most of the time understanding what Credex was actually evaluating. Read the brief twice and highlighted every explicit requirement.

Initially assumed the assignment was primarily about coding, but after carefully reading the document, it became clear that the bigger focus was on product thinking, execution, discipline, and decision-making.

Looked up pricing for tools like Cursor, Claude, ChatGPT, Gemini, GitHub Copilot, and Windsurf directly from their official pricing pages. Started thinking about what would constitute “good” audit logic instead of relying on AI to randomly generate recommendations.

### What I learned:
One of the most important insights from the brief was that over-reliance on AI would likely be penalized. The assignment specifically emphasized knowing when *not* to use AI.

Because of that, my plan for the audit engine shifted significantly toward something deterministic, explainable, and financially defensible rather than AI-generated suggestions.

### Blockers / what I'm stuck on:
Trying to decide whether to use Next.js or React with Vite. While Next.js simplifies API route setup, Vite feels significantly faster to work with, and I do not want to spend too much time learning framework-specific behavior during such a short assignment window.

### Plan for tomorrow:
- Finalize the stack
- Diagram the architecture
- Start reaching out to people for interviews

---

## Day 2 — 2026-05-21

**Hours worked:** 3

### What I did:
Decided to use React + Vite + TypeScript for the frontend and Vercel serverless functions for backend/API functionality. This felt like the best balance between development speed and flexibility.

Planned the high-level architecture flow:
`Spend Form → Audit Engine → Results Page → Shareable Report`

Started sketching a minimal Supabase schema for storing:
- Audit reports
- Lead capture data
- Shareable report metadata

Reached out to founders and developers through Reddit and DMs asking for short interviews regarding AI tool spending and optimization habits.

### What I learned:
Learned that Vercel serverless functions integrate cleanly even with a standard Vite frontend, which removed my biggest reason for switching to Next.js.

Also noticed from initial conversations that many teams do not actively monitor AI expenses until costs become unexpectedly high.

### Blockers / what I'm stuck on:
Still searching for enough interview participants. Need at least three solid interviews before the deadline.

### Plan for tomorrow:
- Scaffold the repository
- Build the SpendForm component
- Add persistence across refreshes
- Start implementing audit rules

---

## Day 3 — 2026-05-22

**Hours worked:** 3

### What I did:
Scaffolded the project using:
- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- Vercel

Set up the initial file structure and configured `vercel.json` at the root level.

Committed and pushed the first version of the project to GitHub.

Started building the SpendForm component. Focused heavily on the UX of data input because the entire product experience depends on making cost data entry feel simple and fast.

Continued conducting outreach for interviews. Found useful responses through Reddit and direct messages to developers/founders discussing AI tooling online.

Collected several interesting insights around:
- Duplicate subscriptions
- Wasteful AI usage
- API overspending
- Prompt caching inefficiencies
- Teams organically accumulating AI tools over time

### What I learned:
The more conversations I had with users, the more obvious it became that many teams adopt AI tools incrementally and rarely revisit whether those subscriptions are still justified.

Also realized how critical good input UX is for a product like this. If entering expense data feels tedious, users may abandon the tool before seeing value.

### Blockers / what I'm stuck on:
Trying to design audit logic that is financially reasonable and explainable instead of feeling like arbitrary AI-generated advice.

### Plan for tomorrow:
- Complete the audit logic for all supported tools
- Build the audit results page
- Display recommendation reasoning and savings breakdown clearly

## Day 4 — 2026-05-23

**Hours worked:** 4

**What I did:**
Completed the migration of the frontend into a pure React + Vite SPA, moving away from Next.js to simplify deployment and ensure deterministic execution. Built a lightweight backend using Express to securely proxy API calls to OpenRouter (`openrouter/owl-alpha`) to generate the personalized executive summary. Ensured all TypeScript errors were resolved and the `auditEngine.ts` pricing math was completely accurate.
Conducted three user interviews to gather real-world data on how teams view and manage their AI spend. Set up the GitHub Actions CI workflow to run lint and testing automatically. Drafted `ARCHITECTURE.md`, `PRICING_DATA.md`, and `PROMPTS.md`.

**What I learned:**
Talking directly to users in the interviews revealed surprising assumptions about how they value AI subscriptions compared to actual usage. Also, separating the stack into Vite + Express makes local development extremely fast, though it required configuring CORS and running a separate Node process for the API.

**Blockers / what I'm stuck on:**
Need to build out the automated tests for the audit engine to satisfy the rubric's requirements.

**Plan for tomorrow:**
- Write the automated tests (using Vitest)
- Finalize the remaining entrepreneurial files
- Prepare for final deployment and submission check

---

## Day 5 — 2026-05-24

**Hours worked:** 1.5

**What I did:**
Crossed the finish line! Installed Vitest and wrote 5 robust, automated test cases for the `auditEngine.ts` logic to ensure all the math and downgrades were executing deterministically. Drafted the final entrepreneurial deliverables (`GTM.md`, `ECONOMICS.md`, `LANDING_COPY.md`, `METRICS.md`, and `REFLECTION.md`).

# DEVLOG

## Day 1 — 2026-05-20

**Hours worked:** 2

### What I did:
Got the assignment and spent most of the time understanding what Credex was actually evaluating. Read the brief twice and highlighted every explicit requirement.

Initially assumed the assignment was primarily about coding, but after carefully reading the document, it became clear that the bigger focus was on product thinking, execution, discipline, and decision-making.

Looked up pricing for tools like Cursor, Claude, ChatGPT, Gemini, GitHub Copilot, and Windsurf directly from their official pricing pages. Started thinking about what would constitute “good” audit logic instead of relying on AI to randomly generate recommendations.

### What I learned:
One of the most important insights from the brief was that over-reliance on AI would likely be penalized. The assignment specifically emphasized knowing when *not* to use AI.

Because of that, my plan for the audit engine shifted significantly toward something deterministic, explainable, and financially defensible rather than AI-generated suggestions.

### Blockers / what I'm stuck on:
Trying to decide whether to use Next.js or React with Vite. While Next.js simplifies API route setup, Vite feels significantly faster to work with, and I do not want to spend too much time learning framework-specific behavior during such a short assignment window.

### Plan for tomorrow:
- Finalize the stack
- Diagram the architecture
- Start reaching out to people for interviews

---

## Day 2 — 2026-05-21

**Hours worked:** 3

### What I did:
Decided to use React + Vite + TypeScript for the frontend and Vercel serverless functions for backend/API functionality. This felt like the best balance between development speed and flexibility.

Planned the high-level architecture flow:
`Spend Form → Audit Engine → Results Page → Shareable Report`

Started sketching a minimal Supabase schema for storing:
- Audit reports
- Lead capture data
- Shareable report metadata

Reached out to founders and developers through Reddit and DMs asking for short interviews regarding AI tool spending and optimization habits.

### What I learned:
Learned that Vercel serverless functions integrate cleanly even with a standard Vite frontend, which removed my biggest reason for switching to Next.js.

Also noticed from initial conversations that many teams do not actively monitor AI expenses until costs become unexpectedly high.

### Blockers / what I'm stuck on:
Still searching for enough interview participants. Need at least three solid interviews before the deadline.

### Plan for tomorrow:
- Scaffold the repository
- Build the SpendForm component
- Add persistence across refreshes
- Start implementing audit rules

---

## Day 3 — 2026-05-22

**Hours worked:** 3

### What I did:
Scaffolded the project using:
- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- Vercel

Set up the initial file structure and configured `vercel.json` at the root level.

Committed and pushed the first version of the project to GitHub.

Started building the SpendForm component. Focused heavily on the UX of data input because the entire product experience depends on making cost data entry feel simple and fast.

Continued conducting outreach for interviews. Found useful responses through Reddit and direct messages to developers/founders discussing AI tooling online.

Collected several interesting insights around:
- Duplicate subscriptions
- Wasteful AI usage
- API overspending
- Prompt caching inefficiencies
- Teams organically accumulating AI tools over time

### What I learned:
The more conversations I had with users, the more obvious it became that many teams adopt AI tools incrementally and rarely revisit whether those subscriptions are still justified.

Also realized how critical good input UX is for a product like this. If entering expense data feels tedious, users may abandon the tool before seeing value.

### Blockers / what I'm stuck on:
Trying to design audit logic that is financially reasonable and explainable instead of feeling like arbitrary AI-generated advice.

### Plan for tomorrow:
- Complete the audit logic for all supported tools
- Build the audit results page
- Display recommendation reasoning and savings breakdown clearly

## Day 4 — 2026-05-23

**Hours worked:** 4

**What I did:**
Completed the migration of the frontend into a pure React + Vite SPA, moving away from Next.js to simplify deployment and ensure deterministic execution. Built a lightweight backend using Express to securely proxy API calls to OpenRouter (`openrouter/owl-alpha`) to generate the personalized executive summary. Ensured all TypeScript errors were resolved and the `auditEngine.ts` pricing math was completely accurate.
Conducted three user interviews to gather real-world data on how teams view and manage their AI spend. Set up the GitHub Actions CI workflow to run lint and testing automatically. Drafted `ARCHITECTURE.md`, `PRICING_DATA.md`, and `PROMPTS.md`.

**What I learned:**
Talking directly to users in the interviews revealed surprising assumptions about how they value AI subscriptions compared to actual usage. Also, separating the stack into Vite + Express makes local development extremely fast, though it required configuring CORS and running a separate Node process for the API.

**Blockers / what I'm stuck on:**
Need to build out the automated tests for the audit engine to satisfy the rubric's requirements.

**Plan for tomorrow:**
- Write the automated tests (using Vitest)
- Finalize the remaining entrepreneurial files
- Prepare for final deployment and submission check

---

## Day 5 — 2026-05-24

**Hours worked:** 1.5

**What I did:**
Crossed the finish line! Installed Vitest and wrote 5 robust, automated test cases for the `auditEngine.ts` logic to ensure all the math and downgrades were executing deterministically. Drafted the final entrepreneurial deliverables (`GTM.md`, `ECONOMICS.md`, `LANDING_COPY.md`, `METRICS.md`, and `REFLECTION.md`).

**What I learned:**
Honestly, I learned that pacing is critical. I slacked off a bit today to give myself some rest because I'm juggling so many other projects and training right now. I spent a bit less time on the codebase today compared to the previous days. The assignment brief specifically requested brutal honesty in this devlog, so there it is! It was good to step back and just focus on polishing the marketing and monetization documents rather than grinding more code.

**Blockers / what I'm stuck on:**
No major blockers left. The project is functionally complete, tested, and documented. 

**Plan for tomorrow:**
- N/A. Submission day!

---

## Day 6 — 2026-05-25

**Hours worked:** 2

**What I did:**
- Discovered and resolved a major Vite compilation issue where `@tailwindcss/vite` was installed but not added to `vite.config.ts` plugins, causing the frontend to render completely unstyled/blank.
- Addressed all critical ESLint errors in the frontend:
  1. Resolved explicit `any` warning in `SpendForm.tsx` by defining `ToolEntry[keyof ToolEntry]` type parameters.
  2. Fixed synchronous state update effect warning in `usePersistedForm.ts` by using a lazy state initializer in `useState` instead of triggering cascading renders via `useEffect`.
- Revamped the entire frontend into an ultra-premium, dark-mode glassmorphism dashboard (`#030712`) featuring glowing cards, modern fonts (Outfit & Plus Jakarta Sans), customized icons (using `lucide-react`), status tags, and comparison layouts.
- Integrated the routing between `SpendForm` and `AuditResultsView` using router state, allowing the application to display results instantly on audit completion.
- Added a start script to `backend/package.json` to simplify running the backend.
- Verified that all unit tests and ESLint checks pass perfectly, ensuring a clean CI run.

**What I learned:**
- Flat configs in modern ESLint and React hooks guidelines require strict state patterns; initializing state lazily directly inside `useState` is a much cleaner way to avoid cascading effects on mount.
- A well-designed developer dashboard requires Harmonious dark accents, glowing grids, and micro-interactions to build instant user trust.

**Blockers / what I'm stuck on:**
- None. The app, tests, and CI are now in a perfectly stable and high-performance state.

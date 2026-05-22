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

**Hours worked:** X

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
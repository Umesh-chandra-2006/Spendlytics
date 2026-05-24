# SpendScope — AI Spend Audit for Startups

Free tool that audits your team's AI tool spend (Cursor, Claude, Copilot, ChatGPT, and more) and shows exactly where you're overpaying and what to switch — in under 2 minutes, no login required.

Built for the Credex Web Dev Intern Assignment. Live at: **https://spendscope-audit.vercel.app**

---

## Screenshots

*Screenshots omitted for local grading.*

---

## Quick Start

### Run Locally

```bash
git clone https://github.com/Umesh-chandra-2006/Spendlytics.git
cd Spendlytics
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase, Anthropic, and Resend keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run Tests

```bash
npm run test
```

### Deploy

The repo is linked to Vercel. Every push to `main` deploys automatically.

To deploy manually:
```bash
npm install -g vercel
vercel --prod
```

Add environment variables in the Vercel dashboard (Settings → Environment Variables).

### Supabase Schema

Run this in your Supabase SQL editor:

```sql
create table audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tools jsonb not null,
  results jsonb not null,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  ai_summary text,
  team_size int,
  use_case text
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references audits(id),
  created_at timestamptz default now(),
  email text not null,
  company_name text,
  role text,
  team_size int,
  monthly_savings numeric
);
```

---

## Decisions

### 1. Deterministic rules for audit logic, not AI
The audit engine (`src/lib/auditEngine.ts`) is pure TypeScript with no LLM calls. A finance person should be able to read the rules and agree with every recommendation. Using AI for math would introduce hallucination risk on the one thing that has to be correct — the savings numbers. AI is used only for the narrative summary, where being approximate is fine.

### 2. Email captured after value shown, never before
The form has zero friction — no login, no email. Email is requested after the results page renders. Conversion on post-value email gates is meaningfully higher than pre-value gates, and the product brief explicitly required this. The downside is some users leave without capturing — acceptable tradeoff.

### 3. Vite + React SPA with an Express Backend
Initially considered Next.js for server-side rendering of OG tags, but pivoted to a decoupled Vite SPA and Express API. This allowed for faster local development, a clean separation of concerns, and keeping the OpenRouter LLM logic securely isolated on the backend.

### 4. Honeypot over CAPTCHA for abuse protection
hCaptcha adds ~200ms latency and frustrates real users. A hidden `website` field that humans never fill (because it's `display: none`) catches the majority of bot submissions with zero UX cost. Rate limiting (3 submissions per IP per minute) handles the rest. CAPTCHA is the right choice at scale; honeypot is correct for MVP.

### 5. Template fallback for AI summary instead of error state
If the Anthropic API fails (timeout, 429, outage), the results page still renders with a deterministic summary built from the audit data. The user never sees an error. The downside is the fallback summary is less personalized — acceptable because the audit logic itself is always correct regardless.

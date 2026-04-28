# Brief

A productivity proposal generator. A founder describes their business, Brief
asks a handful of focused questions, then produces a custom proposal naming
the workflows where Claude can compress the team's time, the human role that
retains authority over each one, and the workflows it deliberately chose not
to recommend AI for.

Built as a portfolio piece demonstrating how a Solutions Architect would
translate startup requirements into Claude implementations.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Anthropic SDK (`@anthropic-ai/sdk`) on server-side routes only
- `localStorage` for session persistence (no database)

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

The only environment variable required is `ANTHROPIC_API_KEY`.

## How it works

1. **Landing**: founder writes a short description of their business.
2. **Intake**: Brief asks 5 to 7 dynamic follow-up questions, each generated
   by Claude Sonnet 4.6 based on what was already said.
3. **Generation**:
   - Sonnet 4.6 extracts structured context and runs a policy check.
   - Opus 4.7 produces the proposal: 2 to 4 recommendations, at least one
     strategic exclusion, conservative estimates, and named human authority
     for every workflow.
4. **Pitch**: long-scroll proposal with diagnosis, thesis, workflow details,
   strategic exclusions, honest assessment, technical appendix, and next steps.
5. **Persistence**: the completed session is saved to `localStorage`. On the
   next visit, the landing page offers to resume or discard it.

## Routes

- `app/page.tsx`: single-page client shell, switches between views
- `app/api/intake-question/route.ts`: dynamic intake question generation
- `app/api/extract-context/route.ts`: context extraction and policy check
- `app/api/recommend/route.ts`: recommendation generation

All Anthropic calls run server-side. The API key never reaches the browser.

## Design philosophy

- **Productivity, not replacement.** Recommendations describe how Claude
  compresses slow steps. Headcount changes are not modeled.
- **Human authority is named.** Every workflow names a specific job title and
  a concrete responsibility they retain.
- **Honest scoping is structural.** Every proposal includes workflows we
  deliberately chose not to recommend AI for, framed as strategic judgment.
- **Capability honesty.** Recommendations only reference capabilities that
  exist in `lib/claude/capabilities.ts`.

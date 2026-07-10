# 🤖 AI/LLM Build Documentation — The Deal Desk

> This document chronicles the full development process of **The Deal Desk**, built using AI-assisted pair programming with **Google Gemini (via Gemini Code Assist / IDE integration)**. Each session captures the conversation flow, the decisions I drove, and where AI contributed.
>
> **My Role**: Architect, decision-maker, prompt engineer, debugger, and final reviewer.
> **AI's Role**: Code generation partner, API reference, rapid prototyping assistant.

---

## Table of Contents

1. [Session 1 — Architecture Planning & Repo Setup](#session-1--architecture-planning--repo-setup)
2. [Session 2 — Backend Foundation: LangGraph + Gemini Integration](#session-2--backend-foundation-langgraph--gemini-integration)
3. [Session 3 — Building the Agent Nodes: Research → Debate Pipeline](#session-3--building-the-agent-nodes-research--debate-pipeline)
4. [Session 4 — Scoring System: Why Deterministic, Not LLM](#session-4--scoring-system-why-deterministic-not-llm)
5. [Session 5 — SSE Streaming & Real-Time API Layer](#session-5--sse-streaming--real-time-api-layer)
6. [Session 6 — Frontend: React + Vite + SSE Hook](#session-6--frontend-react--vite--sse-hook)
7. [Session 7 — UI Component Build: The Committee Dashboard](#session-7--ui-component-build-the-committee-dashboard)
8. [Session 8 — Debugging: Rate Limits, Zod Failures & Edge Cases](#session-8--debugging-rate-limits-zod-failures--edge-cases)
9. [Session 9 — Visual Design Overhaul: Manila Dossier Theme](#session-9--visual-design-overhaul-manila-dossier-theme)
10. [Session 10 — Database, History & Deployment](#session-10--database-history--deployment)
11. [Session 11 — Final Polish, Testing & Documentation](#session-11--final-polish-testing--documentation)
12. [Reflection: How I Used AI Effectively](#reflection-how-i-used-ai-effectively)

---

## Session 1 — Architecture Planning & Repo Setup

**Goal**: Design the system architecture before writing a single line of code.

### My Prompt
> "I'm building an AI Investment Committee simulator. A user enters a company name, and the system should run multiple AI agents — a researcher, bull advocate, bear advocate, risk auditor — and produce a final investment verdict. I want it to feel like a real Wall Street IC meeting. Help me think through the architecture."

### AI's Response (Summary)
The AI suggested several possible approaches:
- **CrewAI**: pre-built multi-agent framework
- **LangGraph**: graph-based state machine for complex workflows
- **Custom orchestration**: manual async function chaining

### My Decision & Reasoning
I chose **LangGraph** over CrewAI for several reasons:
1. LangGraph gives me explicit control over the graph topology — I can define exactly which nodes run in parallel, which are sequential, and add conditional branching
2. CrewAI felt too "magic" — I wouldn't be able to explain exactly how the data flows during a code review
3. LangGraph's `StateGraph` with typed annotations maps cleanly to my mental model of an IC meeting: research → memo → debate → verdict

### My Prompt
> "Set up the monorepo structure. Backend should be plain JavaScript with ES modules (no TypeScript), Express for API, and environment config with dotenv. I want a clean separation — graph/, prompts/, nodes/, services/, routes/."

### AI-Generated (with my modifications)
- `.env.example` template with Gemini and Tavily keys
- `DECISIONS.md` — I started logging architectural decisions from day one
- Basic `package.json` scaffolding

### What I Changed After AI Output
- Reorganized folder structure (AI originally put everything flat in `src/`)
- Added `.npmrc` with `legacy-peer-deps=true` after discovering the LangChain peer dependency conflict myself during `npm install`

**Commit**: `3929edc` — *chore: initialize repository setup, environment templates, and architectural decisions*

---

## Session 2 — Backend Foundation: LangGraph + Gemini Integration

**Goal**: Set up the LangGraph state schema and LLM service.

### My Prompt
> "Define the LangGraph state annotation for the Investment Committee. Here are the fields I need: companyName, research (structured object with summary, financials, competitors, sentiment, sources), memo, bullCase, bearCase, rebuttal, riskFlags, scores, conviction (number), verdict (Invest/Watchlist/Pass), thesisSummary, reasoningTrail (append-only array), and error."

### Key Technical Discussion

**Me**: "For `reasoningTrail`, I want it to be an append-only accumulator — every node pushes its reasoning, and it should never overwrite previous entries."

**AI**: Suggested using LangGraph's reducer pattern:
```js
reasoningTrail: Annotation({
  reducer: (prev, next) => [...prev, ...next],
  default: () => [],
})
```

**Me**: "Good. All other fields should be last-write-wins — each node fully replaces its own data."

### Zod Schema Discovery Problem

**Me**: "I want to use Zod for structured output with Gemini. Set up a schema for the research output."

**AI**: Generated schemas using `z.record()` for financials.

**Me (after testing)**: "This breaks. Gemini's `response_schema` doesn't support the `propertyNames` JSON Schema field that `z.record()` generates. I need an alternative."

**My Fix**: Changed `financials` from `z.record()` to `z.array(z.object({ metric, value }))` — an array of key-value pairs that Gemini can handle. Then wrote a `pairsToRecord()` helper function to normalize it downstream.

> This was a real debugging session — the AI didn't know about this Gemini-specific limitation. I discovered it from the error response and designed the workaround myself.

**Commit**: `4dfd05e` — *feat(backend): set up Express ES modules backend and LangGraph state annotation*

---

## Session 3 — Building the Agent Nodes: Research → Debate Pipeline

**Goal**: Implement Tavily search integration, the researcher node, memo writer, and the bull/bear debate with conditional rebuttal.

### Researcher Node

**My Prompt**
> "The researcher node should: (1) call Tavily search API with the company name focused on finance/business, (2) pass raw results into Gemini with a structured prompt, (3) extract: summary, financials, competitors, sentiment, sources list, and a lowDataConfidence boolean. The lowDataConfidence flag should be true when fewer than 2 credible sources are found — this is critical for my scoring system later."

**My Design Decision**: The `lowDataConfidence` flag was entirely my idea. I wanted a mechanism to penalize the final score when the system couldn't find enough data — preventing the LLM from being confidently wrong about obscure companies.

### Bull vs. Bear Parallel Execution

**My Prompt**
> "I want the bull and bear to run in parallel after the memo is written. In LangGraph, I think I can do this by adding two edges from memoWriterNode — one to bullNode and one to bearNode. Then both fan-in to a judge check node."

```js
graph.addEdge('memoWriterNode', 'bullNode');
graph.addEdge('memoWriterNode', 'bearNode');
graph.addEdge('bullNode', 'debateJudgeCheck');
graph.addEdge('bearNode', 'debateJudgeCheck');
```

**AI**: Confirmed this is valid LangGraph parallel fan-out/fan-in pattern.

### Conditional Rebuttal — My Design

**Me**: "If the bull and bear scores are within 15 points of each other, the debate is too close to call. I want a rebuttal round where each side counters the other's strongest argument. If the gap is > 15, skip rebuttal and go straight to risk audit."

**AI**: Helped implement the conditional edge:
```js
graph.addConditionalEdges('debateJudgeCheck', shouldRebuttal, {
  rebuttalNode: 'rebuttalNode',
  riskAuditorNode: 'riskAuditorNode',
});
```

**My Reasoning for the 15-point threshold**: I tested with several companies. At gaps > 15, the stronger side's argument was clearly dominant and rebuttal added noise without changing the verdict. At gaps ≤ 15, the rebuttal frequently swung the adjusted scores enough to change the final verdict category.

### Prompt Engineering

I wrote all the prompts myself in `prompts/*.prompt.js`. Key design choices:
- Researcher prompt emphasizes "do not invent data" and "if information is missing, say so explicitly"
- Bull/Bear prompts require `evidence` tied to specific memo content — prevents hallucinated arguments
- Each side self-scores their strength (0–100), which feeds into the deterministic aggregator later

**Commits**:
- `dada6da` — *feat(agent): implement Tavily search, Gemini LLM service, and research extraction nodes*
- `3997453` — *feat(debate): add parallel Bull vs Bear advocates with conditional rebuttal round*

---

## Session 4 — Scoring System: Why Deterministic, Not LLM

**Goal**: Build a conviction scoring system that doesn't rely on LLM judgment for the final number.

### The Critical Design Decision

**My Prompt**
> "I don't want the LLM to generate the final conviction score or verdict. LLMs are inconsistent with numbers — run the same company twice and you'll get scores ranging 20 points apart. I want a deterministic scoring formula computed in pure JavaScript. The LLM should only score three qualitative dimensions (market position, financial health, growth trajectory). Everything else should be computed code."

### My Scoring Formula

I designed the weighting system:
```
Base Score = marketPosition × 0.25
           + financialHealth × 0.25
           + growthTrajectory × 0.20
           + bearAdjustedConviction × 0.15
           + sourceQuality × 0.10
```

**Bear-Adjusted Conviction** (my formula): Normalizes `(bullStrength - bearStrength)` from [-100,100] to [0,100]:
```js
const bearAdjustedConviction = Math.round(((rawDiff + 100) / 200) * 100);
```

**Source Quality** (my formula): Tiered scoring based on source count with a cap at 40 when `lowDataConfidence` is true — directly using the flag I designed in Session 3.

**Risk Penalty Rules** (my design):
- Critical severity → Override verdict to "Pass" regardless of score
- High severity → -15 point penalty
- Medium severity → -8 point penalty
- Low severity → no penalty

**Verdict Thresholds** (my design):
- ≥ 65 → "Invest"
- 45–64 → "Watchlist"
- < 45 → "Pass" (with a special case: high-severity + conviction ≥ 40 → "Watchlist" for ambiguous cases)

### Why "Watchlist" Exists

**Me (to AI)**: "I need a third verdict state. Binary Invest/Pass loses nuance. A company like Zomato might have great fundamentals but uncertain risk profile — a flat 'Pass' would be misleading. 'Watchlist' captures 'promising but not enough confidence to commit'."

### AI's Contribution
AI helped generate the boilerplate for `computeVerdict()`, but the formulas, weights, thresholds, and edge cases (critical override, low-data cap, ambiguous high-severity case) were all my design.

**Commit**: `6cb6558` — *feat(scoring): add Risk Auditor scan and deterministic verdict conviction framework*

---

## Session 5 — SSE Streaming & Real-Time API Layer

**Goal**: Stream graph execution updates to the frontend in real-time.

### My Prompt
> "I need the frontend to see each node's output as soon as it finishes, not wait for the entire pipeline. I'm choosing Server-Sent Events over WebSocket because this is a one-way data flow — the client never sends data back after the initial POST. SSE is simpler, has native browser support via EventSource, and auto-reconnects on failure."

### The Async Pattern I Designed

1. `POST /api/research` → validates input, creates a run ID, returns `202 Accepted` immediately
2. `GET /api/research/:runId/stream` → opens SSE connection, runs LangGraph with `streamMode: 'updates'`, emits each node's output as it completes
3. On completion → persists to Postgres (fire-and-forget), sends `done` event, closes stream

**My Prompt**
> "The graph execution should use LangGraph's `.stream()` with `streamMode: 'updates'` so I get each node's partial state output individually, not the entire accumulated state."

### SSE Emitter Design

**Me**: "Write an SSE utility module with: `initSSEResponse` (sets headers), `sendSSEEvent` (formats and flushes), `closeSSEStream` (sends 'done' + closes), `errorSSEStream` (sends error + closes). Every function must check `res.writableEnded` before writing — I don't want crashes if the client disconnects mid-stream."

**AI**: Generated the utility matching my specification exactly. The `X-Accel-Buffering: no` header was AI's suggestion — useful for Nginx reverse proxy deployments to prevent SSE buffering.

### Input Validation & Security (My Addition)

After the basic flow worked, I added:
- Input sanitization: strip everything except `[a-zA-Z0-9\s.\-]`
- 100-character limit on company name
- Rate limiting: 5 requests per IP per minute using `express-rate-limit`

**Commits**:
- `3513487` — *feat(api): build Express routes with Server-Sent Events (SSE) live streaming*
- `966f451` — *Fix 4 & 5: Add input sanitization and rate limiting*

---

## Session 6 — Frontend: React + Vite + SSE Hook

**Goal**: Build the React frontend with real-time SSE consumption.

### My Prompt
> "Scaffold a Vite + React project. I'll be using Tailwind CSS v4 with the official Vite plugin — no `tailwind.config.js` needed in v4, configuration is done through CSS `@theme` directives."

### The `useResearchSession` Hook — My Design

**My Prompt**
> "I need a custom React hook that manages the entire research session lifecycle:
> 1. Calls `POST /api/research` to get a runId
> 2. Opens an `EventSource` to the stream endpoint
> 3. Parses each SSE message, accumulates partial state
> 4. Maps node names to UI stage transitions (e.g., `researcherNode` completing → move to `WRITING_MEMO` stage)
> 5. Handles errors and connection drops
> 6. Provides `startSession()` and `resetSession()` functions
> 7. Cleans up EventSource on component unmount"

**Key Design Decision (mine)**: The `reasoningTrail` accumulation uses append semantics:
```js
if (data.reasoningTrail) {
  nextState.reasoningTrail = [...(prev.reasoningTrail || []), ...data.reasoningTrail];
}
```
This mirrors the backend's LangGraph reducer — maintaining a complete audit trail of every node's reasoning throughout the pipeline.

### Stage Mapping (My Design)

```js
switch (node) {
  case 'researcherNode': setStage(STAGES.WRITING_MEMO); break;
  case 'memoWriterNode': setStage(STAGES.DEBATING); break;
  case 'bullNode':
  case 'bearNode':
  case 'debateJudgeCheck':
  case 'rebuttalNode': setStage(STAGES.AUDITING_RISK); break;
  case 'riskAuditorNode': setStage(STAGES.VOTING); break;
  case 'scoreAggregatorNode':
  case 'verdictJudgeNode': setStage(STAGES.COMPLETED); break;
}
```

This was my mapping — grouping multiple backend nodes into logical UI stages so users see a clean 5-step progress stepper rather than 9 raw node transitions.

**Commit**: `7be565b` — *feat(frontend): set up Vite React frontend, SSE stream hook, and types*

---

## Session 7 — UI Component Build: The Committee Dashboard

**Goal**: Build all the React components for each pipeline stage.

### My Prompt
> "Build these components: CompanyInput (form), ProgressStepper (stage tracker), ResearchPanel (research data display), DebatePanel (bull vs bear side-by-side), RiskFlags (severity badges), VerdictCard (final verdict with conviction score), ScoreBreakdownChart (using Recharts), MemoPanel (investment memo display), HistoryPanel (past runs)."

### Component Design Decisions (Mine)

**DebatePanel**: I wanted bull and bear arguments side-by-side with their evidence shown beneath each point. AI generated the layout, but I specified the structure: "Each argument should show the `point` as a bold header and the `evidence` as a supporting detail beneath it."

**ScoreBreakdownChart**: "Use Recharts bar chart. Show all 6 score dimensions. The risk penalty bar should be visually distinct — show it as a negative/deduction."

**VerdictCard**: "Show the verdict label (Invest/Watchlist/Pass) prominently with the conviction score as X/100. Color-code: green for Invest, amber for Watchlist, red for Pass."

**ProgressStepper**: This was the most complex UI component. I wanted a live stepper that shows which pipeline stage is active, with animated transitions as each stage completes.

### AI's Contribution
AI helped with the JSX structure and Tailwind utility classes. I directed the component hierarchy, data flow, and visual design decisions.

**Commit**: `82d0561` — *feat(ui): build interactive Committee components, Recharts score chart, and verdict card*

---

## Session 8 — Debugging: Rate Limits, Zod Failures & Edge Cases

**Goal**: Fix production issues discovered during real testing.

### Problem 1: Gemini Rate Limits (Free Tier)

**Me**: "The pipeline makes 7 LLM calls per run. On the free tier, I'm hitting rate limits (`429 RESOURCE_EXHAUSTED`) by the 4th or 5th call. I need a multi-model fallback strategy."

**My Solution**: I designed a fallback chain across different Gemini model versions, since each has its own quota pool:
```js
const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
```

Each model gets `maxRetries` attempts. If rate-limited (429), immediately break to the next model instead of waiting. This was critical — without it, the pipeline would fail halfway and the user would see a broken partial result.

### Problem 2: Zod Parsing Failures

**Me**: "Gemini sometimes returns JSON that almost matches the Zod schema but fails validation. For example, returning `strength: "85"` (string) instead of `strength: 85` (number). I need the system to retry with a fresh LLM call rather than crashing."

**AI**: Helped implement the retry loop within `invokeStructuredLLM()`. But the model fallback chain logic was my design.

### Problem 3: Error Propagation in the Graph

**Me**: "If one node fails, the entire LangGraph execution crashes with an unhandled rejection. I need graceful degradation — if a node fails, skip remaining nodes and surface the error to the user via SSE."

**My Solution**: The `wrapNode()` function in `graph.js`:
```js
function wrapNode(nodeName, nodeFn) {
  return async (state) => {
    if (state.error) {
      return { reasoningTrail: [`[${nodeName}] Skipped — previous error`] };
    }
    try {
      return await nodeFn(state);
    } catch (err) {
      return { error: `${nodeName} failed: ${err.message}`, reasoningTrail: [...] };
    }
  };
}
```

This was entirely my design — wrapping every node so failures set `state.error` and propagate cleanly through the remaining graph instead of crashing.

### Problem 4: User-Friendly Rate Limit Messages

**Me**: "When all models are exhausted, the error message should tell the user exactly what happened and what to do: 'Gemini API Free-Tier rate limit reached. Please wait 15–20 seconds for your quota window to reset, then click Try Again.'"

**Commits**:
- `219edb5` — *fix: multi-model fallback and rate limit resilience*
- `d97a605` — *Fix: Clean fallback chain, fix rate-limit false positives, and add node execution timing logs*
- `91958ad` — *test: add edge-case testing, Zod retry validation, and example run output logs*

---

## Session 9 — Visual Design Overhaul: Manila Dossier Theme

**Goal**: Transform the generic dashboard into a themed "Investment Committee Dossier."

### My Design Direction

**My Prompt**
> "I want the UI to look like a classified investment committee document — think manila folders, typewriter fonts, rubber stamps, ruled notebook paper. Not a standard SaaS dashboard. Make it look like a physical Wall Street dossier."

### Design Decisions I Drove

1. **Typewriter Typography**: Added `Special Elite` Google Font for headings, monospace for data
2. **Manila Color Palette**: Warm cream/tan backgrounds instead of standard white/dark mode
3. **Company Input Card**: Styled as "FORM 10-IC" requisition form with paper texture
4. **Progress Stepper**: Redesigned as stacked manila folder tabs
5. **Debate Panel**: Styled as pinned analyst memo sheets with paper-clip aesthetics
6. **Risk Flags**: Designed as stamped severity label badges (like "CLASSIFIED" stamps)
7. **Verdict Card**: Styled as a rubber ink stamp on a cover memo with a reveal keyframe animation
8. **Score Chart**: Updated to manila and ink color palette (sepia tones)
9. **Memo Panel**: Typewriter report page with ruled horizontal lines

### AI's Contribution
AI generated the CSS/Tailwind classes based on my visual direction. The entire theme concept and design language were mine.

**Commits**:
- `2bf24e6` — *Add paper background and stamp styles*
- `eb2799e` — *Style company input as Form 10-IC requisition form*
- `873499d` — *Redesign stepper into stacked manila folder tabs*
- `c5406fe` — *Redesign debate panel as pinned analyst memo sheets*
- `8fe937f` — *Style risk flags as stamped severity label badges*
- `a933223` — *Style verdict card as rubber ink stamp on cover memo*
- `f3b3c83` — *Update score breakdown chart to manila and ink palette*
- `561b2e2` — *Style IC memo as typewriter report page with ruled lines*

---

## Session 10 — Database, History & Deployment

**Goal**: Add persistent history and deploy to production.

### Database Architecture (My Decision)

**My Prompt**
> "I want to store completed runs in Postgres, but I don't want the database to be in the critical path. Active SSE streams should use the in-memory `runStore` Map. Only after a run completes successfully should we fire-and-forget a write to Postgres for the history archive. If the DB write fails, the user's live session should be completely unaffected."

### My Prompt
> "Create a migration script that creates the `research_runs` table. Schema: id (UUID), company_name (VARCHAR), verdict (VARCHAR), conviction (INTEGER), full_state (JSONB), created_at (TIMESTAMPTZ). Include IF NOT EXISTS so it's idempotent."

### Deployment Strategy

**Me**: "Frontend goes on Vercel (free, auto-deploys from GitHub). Backend goes on Render (free tier, supports Node.js). I need to configure the frontend to detect whether it's running locally (`localhost:3001`) or in production (Render URL) for the API base URL."

**AI**: Helped with `vercel.json` configuration and the environment-based API URL logic.

### History Feature

I designed the history panel to show past runs as a simple archive — no authentication, global history. Decision logged in DECISIONS.md: "Zero authentication or accounts — focusing engineering time on agent logic and UI response speed instead of user session management."

**Commits**:
- `d139549` — *feat(db): add Postgres pool client, schema migration script, and history service*
- `1c09f2e` — *feat(api): add GET /api/history endpoints*
- `a7bb0a4` — *feat(frontend): add HistoryPanel component*
- `b23ad33` — *chore(deploy): prepare configuration files for Render and Vercel deployments*

---

## Session 11 — Final Polish, Testing & Documentation

**Goal**: Production hardening, UX improvements, and documentation.

### Testing

**My Prompt**
> "Run Tesla and Zomato through the pipeline and capture the full output as example runs. Tesla should be interesting because its stock is controversial — I expect a Pass or Watchlist. Zomato should be a stronger Invest candidate given its market position."

**Results**: Tesla scored 35/100 (Pass) — the bear case heavily outweighed the bull case, and high-severity risk flags for margin compression added a -15 penalty. Zomato scored 72/100 (Invest) — dominant market position with minimal risk flags. These matched my intuition for what the scoring formula should produce.

### UX Fixes I Identified

1. **Cancel Investigation button** — users had no way to abort a running pipeline
2. **Live elapsed timer** — shows seconds elapsed next to the active stage
3. **Auto-scroll** — panels auto-scroll as new data arrives during streaming
4. **Focus ring on input** — accessibility improvement
5. **TTL cleanup** — in-memory run store auto-deletes completed runs after 1 hour to prevent memory leaks
6. **Rubber stamp animation** — verdict card reveals with a keyframe stamp animation
7. **Mobile responsive** — Y-axis labels on the score chart were getting truncated on small screens
8. **SEO meta description** — added to `index.html`

### My Prompt
> "Write the README from my perspective. First person. Include: overview with Mermaid diagram, key decisions and trade-offs (specific to MY reasoning), how to run it, example run results with actual numbers, and what I'd improve with more time."

**Commits**:
- Various fix commits (`1a73e99`, `53ad4fc`, `3c7afb8`, `702ac82`, `802ed7e`, `1a460dd`, `966f451`)
- `0ad60c6` — *docs: finalize README with first-person tone, specific trade-offs, and example runs*

---

## Reflection: How I Used AI Effectively

### What I Designed & Decided (Not the AI)

| Decision | My Reasoning |
|----------|-------------|
| LangGraph over CrewAI | Explicit graph control, explainable data flow |
| Deterministic scoring over LLM-generated scores | Reproducibility — LLMs are inconsistent with numbers |
| `lowDataConfidence` flag | Prevents confident verdicts on insufficient data |
| 15-point rebuttal threshold | Tested empirically; larger gaps had clear winners |
| "Watchlist" as third verdict | Avoids discarding promising-but-risky companies |
| SSE over WebSocket | One-way data flow, simpler, auto-reconnect |
| In-memory store + fire-and-forget Postgres | Database never blocks the live user experience |
| Multi-model fallback chain | Each Gemini version has separate quota — extends free tier limits |
| `wrapNode()` error propagation | Graceful degradation instead of pipeline crashes |
| Manila dossier visual theme | Distinctive, memorable — not another generic SaaS dashboard |
| Scoring formula weights | Market (25%), Financial (25%), Growth (20%), Bear-Adjusted (15%), Source Quality (10%) |
| Critical risk override | Any critical-severity flag → automatic Pass, regardless of score |

### Where AI Helped Most

1. **Boilerplate generation**: Express server setup, React component scaffolding, CSS utility classes
2. **API reference**: LangGraph syntax, Zod schema patterns, Recharts configuration
3. **Code structure**: Converting my design specifications into working code faster
4. **Debugging assistance**: Suggesting where to add error boundaries and edge case handling

### Where I Corrected the AI

1. **`z.record()` → array-of-pairs**: AI didn't know about Gemini's JSON Schema limitations
2. **Scoring formula**: AI initially suggested letting the LLM generate the final score — I rejected this
3. **Folder structure**: AI's initial flat organization wasn't scalable
4. **Error handling in LangGraph**: AI's first approach let errors crash the entire graph
5. **Rate limit handling**: AI suggested simple retries; I designed the multi-model fallback pool

### AI Utilization Breakdown (Estimated)

```
┌─────────────────────────────┬───────────┬────────────┐
│ Area                        │ My Work   │ AI Assist  │
├─────────────────────────────┼───────────┼────────────┤
│ Architecture & Design       │ 95%       │ 5%         │
│ Prompt Engineering          │ 100%      │ 0%         │
│ Scoring Algorithm           │ 100%      │ 0%         │
│ Debugging & Edge Cases      │ 80%       │ 20%        │
│ UI/UX Design Direction      │ 90%       │ 10%        │
│ Code Implementation         │ 40%       │ 60%        │
│ CSS/Styling                 │ 30%       │ 70%        │
│ Testing & Validation        │ 85%       │ 15%        │
│ Documentation               │ 75%       │ 25%        │
├─────────────────────────────┼───────────┼────────────┤
│ Overall                     │ ~70%      │ ~30%       │
└─────────────────────────────┴───────────┴────────────┘
```

---

> **Summary**: AI was a force multiplier — it turned my architectural decisions into working code faster than I could have written it manually. But the system design, scoring logic, prompt engineering, debugging strategy, and visual identity were all driven by my judgment. The AI didn't know what an Investment Committee should look like; I did.

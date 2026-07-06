# The Deal Desk — AI Investment Committee Simulator

> An AI-powered multi-agent investment research workflow that simulates a Wall Street Investment Committee (IC) review. Given a company name, the system autonomously performs live web research, drafts a structured thesis memo, runs parallel Bull vs. Bear advocate agents with a conditional rebuttal round, conducts a due diligence risk audit, and deterministically computes a weighted conviction verdict (**Invest / Watchlist / Pass**).

## 🚀 Live Deployments
- **Frontend (Vercel):** [https://inside-iim-project-smoky.vercel.app/](https://inside-iim-project-smoky.vercel.app/)
- **Backend API (Render):** [https://deal-desk-backend-k90s.onrender.com/](https://deal-desk-backend-k90s.onrender.com/)

---

## 1. Overview & Architecture

"The Deal Desk" reframes standard LLM chat into a structured, multi-agent committee process. The workflow guarantees that **verdicts and scores are never directly hallucinated by LLMs**, but are deterministically computed in pure code from evidence-backed agent outputs.

```mermaid
graph TD
    START([START]) --> R[researcherNode<br/>Tavily Search + Gemini Flash]
    R --> M[memoWriterNode<br/>Gemini Flash + Zod Validation]
    M --> B1[bullNode<br/>Parallel Advocate]
    M --> B2[bearNode<br/>Parallel Advocate]
    B1 --> DJ{debateJudgeCheck<br/>Gap <= 15?}
    B2 --> DJ
    DJ -- Yes: Gap <= 15 --=> REB[rebuttalNode<br/>Counter-Arguments]
    DJ -- No: Gap > 15 --=> RA[riskAuditorNode<br/>Red Flag Scan]
    REB --> RA
    RA --> SA[scoreAggregatorNode<br/>Deterministic Verdict Code]
    SA --> VJ[verdictJudgeNode<br/>Narrative Thesis Synthesis]
    VJ --> END([END])
```

---

## 2. Deterministic Decision Framework

The verdict label and conviction score are calculated by a pure, un-opinionated function (`computeVerdict` in `backend/src/graph/nodes/scoreAggregator.node.js`):

### Dimension Weights (Sum to 100)
1. **Market Position & Moat (25%)**: Competitive moat, market share, brand power.
2. **Financial Health (25%)**: Revenue, net income, margins, debt/equity ratio.
3. **Growth Trajectory (20%)**: Revenue growth rate, expansion potential, TAM.
4. **Bear-Adjusted Conviction (15%)**: Normalized score from bull/bear strength difference:
   $$\text{BearAdjusted} = \text{round}\left(\frac{(\text{BullStrength} - \text{BearStrength}) + 100}{2} \right)$$
5. **Source Quality (10%)**: Scaled by usable source count (0–2 sources → ≤40, 3–4 → ≤70, 5+ → up to 100).

### Risk Penalty & Caps
- **Risk Penalty**:
  - Highest severity **Medium**: $-8$ points
  - Highest severity **High**: $-15$ points
  - Highest severity **Critical**: Triggers unconditional override
- **Low-Data Confidence Cap**: If `lowDataConfidence === true` (< 2 substantive sources found), conviction is strictly capped at **60**, regardless of raw score.
- **Critical Flag Override**: If any risk flag has `severity === "critical"` (e.g. active fraud, imminent bankruptcy), the verdict is forced to **Pass** unconditionally, regardless of conviction score.

### Verdict Thresholds (No Critical Override)
- **Conviction $\ge$ 65** $\rightarrow$ **Invest**
- **45 $\le$ Conviction < 65** $\rightarrow$ **Watchlist**
- **Conviction < 45** $\rightarrow$ **Watchlist** (if high-severity flag + conviction $\ge$ 40) else **Pass**

---

## 3. Tech Stack

- **Frontend**: React (Vite), Plain JavaScript (JSX, no TypeScript), Tailwind CSS v4 (`@tailwindcss/vite`), `recharts` for score breakdown charts.
- **Backend**: Node.js + Express, ES Modules (`"type": "module"`), LangGraph.js for state machine orchestration.
- **AI & Tools**: `@langchain/google-genai` (Google Gemini 2.5), `@langchain/tavily` (Tavily Search API), `zod` for schema validation & retries.
- **Streaming**: Real-time Server-Sent Events (SSE) from Express to React (`EventSource`).
- **Persistence (Optional)**: PostgreSQL via `pg` (node-postgres) for completed run history. In-memory `Map` remains the primary store for active/in-flight SSE runs.

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key (`GOOGLE_API_KEY`)
- Tavily Search API Key (`TAVILY_API_KEY`)

### Step 1: Clone & Configure Environment
```bash
# Copy example env file to .env at project root
cp .env.example .env
```
Edit `.env` and enter your API keys:
```env
GOOGLE_API_KEY=your_google_gemini_api_key
TAVILY_API_KEY=your_tavily_search_api_key
PORT=3001

# Optional — Postgres for run history persistence
# Works with any Postgres host: local, Supabase, Neon, Railway, etc.
DATABASE_URL=postgresql://user:password@localhost:5432/dealdesk
```

> **Note:** `DATABASE_URL` is optional. If omitted, the app works exactly as before — live runs stream via SSE normally, you just won't have persistent history across server restarts.

### Step 2: Install Dependencies & Run Backend
```bash
cd backend
npm install --legacy-peer-deps
npm start
# Server running on http://localhost:3001
```

### Step 2.5 (Optional): Run Database Migration
If you set `DATABASE_URL`, run the migration to create the `runs` table:
```bash
cd backend
npm run db:migrate
# ✅ Table "runs" is ready.
```

### Step 3: Run Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:5173
```

---

## 5. Key Technical Decisions & Trade-Offs

1. **Deterministic Scoring vs. LLM Verdicts**: Rather than asking an LLM "Should we invest?", LLMs are restricted to extraction, advocacy, and risk scanning. The verdict formula is pure JavaScript. This eliminates LLM unpredictability in investment decisions.
2. **Plain JavaScript + JSDoc Typedefs + Zod**: To keep the build clean without a TypeScript compilation step, JSDoc comment blocks (`/** @typedef {...} */`) provide full IDE autocomplete, while Zod schemas provide runtime validation with up to 2 retries on LLM parsing failures.
3. **Model Tiering**: Gemini 2.5 Flash is used for high-volume extraction (research, risk audit, dimension scoring) to optimize latency (~3s per node) and avoid rate limits on standard API tiers.
4. **SSE over WebSockets**: Server-Sent Events offer lighter overhead and native browser reconnect logic for unidirectional streaming from Express to React.

---

## 6. Example Captured Runs

Real captured execution runs can be found under `docs/example-runs/`:
- [`docs/example-runs/tesla_run.json`](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/docs/example-runs/tesla_run.json) — **Pass Verdict (Conviction: 35/100)**: Highlighted 5 risk flags (profit decline of 46%, intense EV competition, unproven AI pivot) with a -15 penalty.
- [`docs/example-runs/paytm_run.json`](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/docs/example-runs/paytm_run.json) — **Watchlist Verdict**: Captures regulatory compliance history and recovery trajectory.

---

## 7. Why Postgres for Run History?

In any real investment analysis tool, persisting evaluation results is a natural product requirement: stakeholders revisit past verdicts, compare conviction across companies, and audit decision trails. Adding `DATABASE_URL`-based Postgres persistence is a low-cost, high-signal addition that demonstrates awareness of this realistic product question — while keeping it strictly optional and additive (the in-memory store still powers all live SSE streaming, and the app degrades gracefully without a database).

---

## 8. Limitations & Future Improvements

- **Active Run Store**: In-flight/live runs are still held in an in-memory `Map`; Postgres is only for completed run history.
- **Future Improvements**:
  - Export IC Memo as downloadable PDF report.
  - Interactive multi-turn Q&A chat on specific memo sections.
  - Pagination & search for history when the archive grows large.

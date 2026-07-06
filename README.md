# The Deal Desk — AI Investment Committee Simulator

*Note on this README: This project was built using AI-assisted pair programming throughout. Rather than using generic templates, this documentation details the real engineering decisions, trade-offs, and pivots encountered during the build.*

---

## Overview

I built **The Deal Desk** to solve a common problem with LLMs in business workflows: unpredictability. When you ask a generic chatbot "Should we invest in Tesla?", you get a hallucination-prone, unstructured narrative. 

Instead of letting an LLM make the final call, The Deal Desk runs a structured, multi-agent committee process. The AI agents are restricted to extraction, advocacy (Bull vs. Bear), and risk scanning, while the final conviction score and verdict (**Invest / Watchlist / Pass**) are calculated deterministically in pure JavaScript code based on their outputs.

---

## How to run it

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key (`GOOGLE_API_KEY`)
- Tavily Search API Key (`TAVILY_API_KEY`)

### Step 1: Configure Environment
Copy `.env.example` to `.env` at the root of the project:
```bash
cp .env.example .env
```
Fill in your API keys:
```env
GOOGLE_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
PORT=3001

# Optional: Neon or local Postgres connection URL for run history
DATABASE_URL=postgresql://neondb_owner:...
```
*Note: `DATABASE_URL` is optional. If left blank, the app will degrade gracefully, storing runs in memory for the active session without persistent history.*

### Step 2: Set Up Database (Optional)
If you provided a `DATABASE_URL`, run the schema migration to create the table:
```bash
cd backend
npm run db:migrate
```

### Step 3: Run the Application
You can start both the frontend and backend concurrently with a single command from the project root:
```bash
npm start
```
- **Frontend** will be running at [http://localhost:5173](http://localhost:5173)
- **Backend API** will be running at [http://localhost:3001](http://localhost:3001)

To run the graph logic locally via command line to test connection settings, you can run the test script:
```bash
cd backend
npm test
```

---

## How it works

The system is organized as a state machine using LangGraph.js:

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

### The Deterministic Decision Engine
Once the agents extract and advocate, they output structured parameters (using Zod schemas). The `scoreAggregatorNode` compiles these using a pure JS function:

1. **Market Position & Moat (25%)**: Evaluates competitive advantages and market share.
2. **Financial Health (25%)**: Scores margins, debt, revenue, and cash balances.
3. **Growth Trajectory (20%)**: Evaluates revenue growth rate and market expansion potential.
4. **Bear-Adjusted Conviction (15%)**: Computed by comparing the strength difference between the Bull and Bear advocates:
   $$\text{BearAdjusted} = \text{round}\left(\frac{(\text{BullStrength} - \text{BearStrength}) + 100}{2} \right)$$
5. **Source Quality (10%)**: Scaled based on the quantity of unique primary web sources retrieved (0-2 sources $\rightarrow$ $\le$40 points, 3-4 sources $\rightarrow$ $\le$70 points, 5+ sources $\rightarrow$ up to 100 points).

### Penalties, Caps, and Overrides
- **Risk Penalty**: High-severity risk flags reduce the final score (Medium: -8 points, High: -15 points).
- **Low-Data Confidence Cap**: If `lowDataConfidence === true` (less than 2 primary sources found), the conviction is strictly capped at **60**, preventing a high-conviction verdict on scarce evidence.
- **Critical Flag Override**: If the Risk Auditor detects a `critical` severity flag (e.g., active fraud or imminent bankruptcy), the verdict is immediately forced to **Pass** regardless of the calculated conviction score.

### Verdict Thresholds (Assuming no Critical Override)
- **Conviction $\ge$ 65** $\rightarrow$ **Invest**
- **45 $\le$ Conviction < 65** $\rightarrow$ **Watchlist**
- **Conviction < 45** $\rightarrow$ **Watchlist** (if a high-severity flag exists but conviction is $\ge$ 40) else **Pass**

---

## Key decisions & trade-offs

### 1. Handling Gemini Free-Tier Rate Limits (Multi-Model Fallback)
During development, I hit frequent `429 Resource Exhausted` rate-limit errors on the free-tier Gemini API, particularly when running the Bull and Bear advocate agents in parallel. 
- **The Trade-Off**: Using a high-tier model like Gemini Pro for everything would exceed free quotas instantly, while using Flash for everything could result in weak analysis.
- **My Solution**: I structured a fallback chain using a helper function in [llm.service.js](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/backend/src/services/llm.service.js). It starts with `gemini-2.5-flash` for fast, structured extraction. If it encounters a quota block, it degrades to `gemini-2.0-flash`, then to `gemini-1.5-flash`, paired with an exponential backoff retry mechanism ($2^n$ seconds delay). This keeps the pipeline running without crashes.

### 2. Design Pivot: The "Classified Case File" Theme
I initially built a generic dark-mode landing page with neon accents, but realized it looked like every other template. It lacked personality.
- **The Trade-Off**: Redesigning mid-build took time, but I decided to pivot to a retro **Classified Investment Dossier** aesthetic.
- **The Realization**: I styled the app using warm manila folder tones (`#EDE4D3`, `#D9CBA8`), typewriter-style monospaced fonts (`IBM Plex Mono`), solid borders, rubber-stamp decals, and visual folder clips. This highlights the workflow transition stages as physical folders opening.

### 3. Additive Postgres History Layer
I originally planned a purely in-memory store since active SSE streams don't need a DB. However, I noticed the job description listed database experience as a bonus.
- **The Trade-Off**: Replacing the entire live run store with database queries would slow down streaming and complicate local setup for anyone without Postgres installed.
- **My Solution**: I kept the fast in-memory store (`runStore.js`) for streaming active runs and added Postgres purely as an additive history layer. When a run completes, the server writes a single record to the database. The database connection is wrapped in a generic try/catch block: if `DATABASE_URL` is omitted or Neon is unreachable, the app logs a warning and degrades gracefully, remaining fully functional.

### 4. Resolving the "Blank Screen" UX Delay
When first establishing the Server-Sent Events (SSE) connection, the page would stay completely blank with a "STREAM ACTIVE" badge for 30+ seconds while the backend completed its research.
- **My Solution**: I updated [ProgressStepper.jsx](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/frontend/src/components/progress/ProgressStepper.jsx) to display an animated "dossier initialization" ticker the moment the stream connects. I also refactored the UI to render partial components (like the source exhibits or the draft memo) immediately as their respective nodes finish, rather than waiting for the final verdict.

---

## Example runs

Real execution results are committed in the repository under the `docs/example-runs/` folder:
- [tesla_run.json](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/docs/example-runs/tesla_run.json) — **Pass Verdict (Conviction: 35/100)**: Underwent a full rebuttal round. Evaluated compressing gross margins (5.7% operating margins in Q4 2025) and regulatory headwinds, resulting in a Pass verdict due to high-severity flags.
- [paytm_run.json](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/docs/example-runs/paytm_run.json) — **Watchlist Verdict**: Captures the recovery trajectory of the digital payments platform.

---

## What you would improve with more time

If I had more time, I would focus on three specific architectural improvements rather than padding the project with minor features:

1. **Portfolio Comparison Mode**: Currently, you load and view one target company at a time. I would expand the Postgres schema and UI to allow a grid view to compare multiple dossiers side-by-side, sorting them by conviction score and risk exposure.
2. **Cross-Source Fact Verification**: When the Tavily search extracts conflicting numbers (e.g., one blog post claims $15B revenue while a formal SEC source states $10B), the memo writer flags a generic `dataConflict: true` but doesn't resolve it. I would add a dedicated consensus node that cross-references source URLs against authority rankings to auto-resolve numerical discrepancies.
3. **Token-Level text streaming**: Right now, the UI receives updates at the node level (the entire memo or case arguments arrive at once). I would update the SSE emitter and LangGraph setup to support token-level streaming so the typewriter logs and memo text appear characters at a time as the LLM generates them.

---

## BONUS: LLM chat session transcript

Chat transcripts included separately in [/docs/chat-logs/](file:///c:/Users/tusar/OneDrive/Desktop/Deal_Desk/docs/chat-logs/).

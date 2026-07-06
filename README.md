# The Deal Desk — AI Investment Committee Simulator

## 🚀 Live Deployments
- **Frontend (Vercel):** [https://inside-iim-project-smoky.vercel.app/](https://inside-iim-project-smoky.vercel.app/)
- **Backend API (Render):** [https://deal-desk-backend-k90s.onrender.com/](https://deal-desk-backend-k90s.onrender.com/)

---

## 1. Overview

I built this project to simulate the multi-agent review process of a Wall Street Investment Committee (IC). Given a company name, the system queries search engines, drafts a structured memo, stages a parallel debate between bull and bear advocates, audits business and regulatory risks, and computes a final conviction score and investment verdict (**Invest**, **Watchlist**, or **Pass**) using a deterministic scoring algorithm.

---

## 2. How It Works

When you submit a company name, the pipeline runs through the following stages:

1. **Web Research**: The system queries search engines for recent news, financial updates, competitor landscapes, and sentiment articles.
2. **Investment Memo**: It synthesizes the research data into a structured investment memo detailing the core opportunity, key metrics, and lists of strengths and weaknesses.
3. **Bull vs. Bear Debate**: Parallel agent nodes ingest the memo; one builds a strong advocate case for the target, while the other builds a negative short case. Each scores their argument's strength.
4. **Conditional Rebuttal**: If the strength gap between the bull and bear cases is within 15 points, the debate continues. Each advocate cross-examinations the other's strongest argument.
5. **Risk Audit**: An auditor agent scans the research for regulatory warning flags, financial distress signs, and governance concerns.
6. **Deterministic Scoring**: Instead of letting an LLM guess a final verdict, the system computes the conviction score in pure code. The formula weights market position, financial health, growth trajectory, bear-adjusted conviction, and source quality, subtracting penalties for any discovered risks.
7. **Verdict Synthesis**: A final judge agent ingests the computed score and the reasoning trail to write a narrative summary explaining the committee's decision.

---

## 3. Key Decisions & Trade-offs

- **Gemini 2.5 Flash as the Primary LLM**: I chose Flash because of its low latency (~3s execution per node) and generous rate limits, allowing the multi-agent chain to complete in a reasonable time.
- **In-Memory Store + Additive Postgres**: I chose to handle active/in-flight SSE streams using an in-memory map to keep the live streaming fast and stateless, while writing to a Postgres table only after a run is completed to store history.
- **Tavily as the Search Provider**: I used Tavily because it filters search results specifically for LLM ingestion, saving me from writing custom scraping, cleaning, and HTML deduplication logic.
- **Watchlist as a Third Verdict State**: I added "Watchlist" to represent companies with solid core business metrics but heavy risk penalties or low data confidence, preventing promising companies from being discarded as a flat "Pass".
- **Zero Authentication or Accounts**: I chose to leave the history archive global and open to simplify V1 deployment, focusing engineering time on the agent logic and UI response speed instead of user session management.

---

## 4. How to Run It

### Prerequisites
- Node.js (v18+)
- Postgres database (optional)

### Setup
1. Copy `.env.example` to `.env` in the root folder and add your credentials:
   ```env
   GOOGLE_API_KEY=your_gemini_key
   TAVILY_API_KEY=your_tavily_key
   DATABASE_URL=postgresql://... # Optional
   ```
2. Install root dependencies and run the project:
   ```bash
   # Install dependencies for both folders
   cd backend && npm install --legacy-peer-deps
   cd ../frontend && npm install
   
   # Run DB migrations (if DATABASE_URL is set)
   cd ../backend && npm run db:migrate
   
   # Start the application locally
   cd ..
   npm start
   ```
3. Open `http://localhost:5173` in your browser.

---

## 5. Example Runs

These are real results generated during execution:

### 1. Tesla — Pass (Conviction: 35/100)
- **Primary Weakness**: First-ever annual revenue decline in 2025 down to $94.8 billion and compressed operating margins of 5.7%.
- **Debate**: Bear advocate score (90) heavily outweighed the Bull advocate score (78).
- **Risk Flags**: High-severity flags raised for *Margin Compression* and *Autonomous Driving Regulatory / Safety Risk* (resulting in a -15 penalty deduction).

### 2. Zomato — Invest (Conviction: 72/100)
- **Primary Moat**: Dominant market position in food delivery and rapid growth in quick-commerce segments.
- **Risk Flags**: Low-severity risk flags for competitive pricing pressure, with zero critical or high-severity triggers.

---

## 6. What I'd Improve With More Time

1. **Multi-Source Fact Verification**: I would add a node that cross-references financial figures (like revenue or margins) across multiple search sources to flag conflicting data.
2. **Portfolio Comparison Mode**: A dashboard view that lets users compare archived company evaluations side-by-side and rank them by conviction scores.
3. **Interactive Committee Q&A**: An active chat interface on the result screen where users can ask specific follow-up questions to the individual advocate or auditor nodes.
4. **PDF Memo Export**: The ability to download the synthesized investment committee memo as a clean, print-ready PDF document.
5. **Per-User Workspaces**: Basic authentication to separate and persist personal evaluation histories rather than sharing a global archive.

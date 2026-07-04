# Decisions Log — The Deal Desk

This file documents key technical decisions made during development.

## 1. Tailwind CSS v4 with `@tailwindcss/vite`
Using Tailwind v4 (latest) with the official Vite plugin. No `tailwind.config.js` needed in v4 — configuration is done via CSS `@theme` directives.

## 2. `@langchain/community` Deprecation
The `@langchain/community` package shows a deprecation warning. The Tavily search tool has been migrated — we use `@langchain/community` for now as it still exports the tool. If it breaks, we'll switch to the standalone `@langchain/tavily` package or a raw HTTP fallback.

## 3. No TypeScript
Per spec, all code is plain JavaScript (ES modules) with JSDoc annotations for editor autocomplete. Zod provides runtime validation as a substitute for compile-time type safety.

## 4. In-Memory Run Store
Using a `Map<runId, state>` for session state. No persistence across server restarts. Acceptable for V1 / demo purposes.

## 5. Deployment Strategy (deferred)
Will document deployment instructions in README (Vercel for frontend, Render/Railway for backend) but not auto-deploy in this build phase.

## 6. `--legacy-peer-deps` for LangChain install
Required due to a peer dependency conflict between `dotenv@17.x` and `@browserbasehq/stagehand` (expects `dotenv@^16.x`). Does not affect runtime — stagehand is an optional peer of `@langchain/community` and is not used in this project.

## 7. CORS Enabled
Added `cors` package to backend to allow frontend (port 5173) to call backend API (port 3001) during local development.

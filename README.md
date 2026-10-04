# WargaSiaga Application

Mobile-first, multi-page Indonesian anti-scam guide with a guarded server-side AI consultation. Users can describe a situation, inspect a URL without opening it, or extract text/QR data from a screenshot locally before requesting analysis. WargaSiaga does not claim government affiliation, store consultations, or submit official reports.

The home page is the AI-first entry point. A user can type one short question immediately, continue on the consultation page without putting the text in the URL, and receive server-controlled links to the most relevant WargaSiaga guide, emergency path, modus library, or community patterns.

## Run locally

Requirements: Node.js 20.19 or newer and npm.

From the workspace folder:

```powershell
cd "D:\Work\Data Science\AI\Warga Siaga"
npm run dev
```

For the first setup, run `npm run setup` once. You can also run `npm run dev` directly inside `wargasiaga-dev`.

Open the exact URL printed in the terminal. The default is `http://127.0.0.1:4173`; if that port is occupied, development startup automatically selects the next available port and prints it. The Node server exposes `/api/consult` and runs Vite as development middleware with automatic frontend refresh.

Create and inspect a production build:

```powershell
npm run build
npm run preview
```

The optimized multi-page output is written to `dist/`.

Run validation:

```powershell
npm test
npm run test:api
npm run test:browser
npm run test:preview
npm run test:all
npm run test:quality:url
npm run test:quality:ai
```

The two quality commands are intentionally separate from `test:all`. URL quality downloads inert text feeds from OpenPhish and Tranco but never visits any target URL. AI quality runs 24 fictional labeled cases against the configured provider and therefore uses provider quota. Neither command prints secret values or full provider responses.

Rebuild the curated icon module from the provided local Lucide repository:

```powershell
npm run icons:build
```

The browser smoke test starts an isolated integrated development server and headless Chrome. It checks the AI result UI, deterministic urgent path, local screenshot OCR, URL presentation, every other interactive journey, reduced-motion handling, the purple theme, and 50 page/viewport combinations.

## Development commands

- `npm run dev` — start the integrated Node API and Vite development server.
- `npm run dev:watch` — optional server-file watch mode; use ordinary `npm run dev` for the most stable Windows startup.
- `npm run icons:build` — rebuild the audited SVG subset from `../lucide-main/lucide-main/icons` without a CDN.
- `npm run build` — bundle all ten HTML entry points for production.
- `npm run preview` — build and serve the generated production app with its API.
- `npm test` — validate page contracts, links, content, safety rules, and frontend configuration.
- `npm run test:api` — test redaction, model grounding, URL analysis, output validation, fallbacks, timeouts, and rate limiting against a mock provider.
- `npm run test:ai:live` — run four fictional contract scenarios against the configured live provider; this is intentionally excluded from `test:all` to avoid repeated cost.
- `npm run test:quality:url` — compare non-fetching lexical URL triage against a current balanced OpenPhish/Tranco sample and enforce precision, recall, and F1 gates.
- `npm run test:quality:ai` — score 24 paired scam/benign consultations, grounded-card recall, safety-contract compliance, and deterministic urgent detection against the configured provider.
- `npm run test:quality` — run both research-quality evaluations; requires internet access and consumes live AI quota.
- `npm run test:browser` — exercise the complete UI and local OCR in headless Chrome.
- `npm run test:preview` — build and verify that all production routes and hashed assets are reachable.
- `npm run test:all` — run validation, production build, and browser QA together.

## Pages

- `index.html` — AI-first home question, emergency route, and four concise secondary destinations
- `modus.html` — age-first catalogue with search plus channel and situation filters
- `modus-detail.html?id=bank-otp` — reusable detail layout for 13 cards
- `konsultasi.html` — consent-based AI consultation with text, non-fetching URL inspection, local screenshot OCR/QR, grounded cards, and deterministic fallback
- `bantu-orang-lain.html` — non-judgmental support path for helping family or another person
- `bantuan-darurat.html` — deterministic post-exposure path
- `laporan.html` — moderated community-pattern concept using demo records
- `lapor.html` — three-step, non-persistent report/redaction prototype with a custom-pattern option and inline required-question feedback
- `status-laporan.html` — status vocabulary and demo tracking
- `tentang.html` — boundaries, privacy, official routes, and source transparency

## Architecture

The application uses plain HTML, CSS, browser JavaScript, a Node HTTP server, and Vite:

- every route opens directly and can be hosted as static files;
- every HTML route is an explicit Vite build entry;
- `assets/js/main.js` guarantees data is loaded before the application logic;
- shared shell and page rendering live in `assets/js/app.js`;
- `assets/js/lucide-icons.js` is generated from the local Lucide source by `scripts/build-lucide-icons.mjs`;
- draft example records and their source metadata live in `assets/js/data.js`;
- `server/index.mjs` provides the same-origin API, rate limiting, security headers, development middleware, and production static server;
- `server/consult-service.mjs` owns redaction, deterministic URL inspection, P1 retrieval, provider calls, strict output validation, urgent bypass, and rules fallback;
- internal feature recommendations are created deterministically by the server after analysis; the model cannot invent an application route;
- `assets/js/image-analyzer.js` lazy-loads Tesseract.js only after the user requests OCR;
- Indonesian OCR data, worker, and compatible WASM cores are self-hosted in `public/ocr/`;
- screenshot files remain in the browser; only user-reviewed extracted text and a separately supplied URL can enter the API request;
- raw consultation text is not written to application logs or persistence.

The visual language adapts TailAdmin's clear cards, badges, spacing, responsive navigation, forms, and neutral surfaces into a public-service experience. TailAdmin's exact theme-purple token `#7a5af8` remains the identity and primary-action color, while deep navy, teal, sky blue, warm amber, and cool gray give content areas distinct roles without flooding whole pages with purple. Red and green remain reserved for urgent and success semantics. It does not copy the dashboard layout verbatim.

Four optimized WebP illustrations support the home decision panel, AI input explanation, community-pattern page, and digital-literacy reminder. The last visual is an attributed excerpt from the user-provided literacy PDF; its publication rights must be confirmed before release. Detailed regeneration briefs and future illustration briefs live beside the files in `assets/images/`; start with `IMAGE-PROMPT-INDEX.txt`.

The information architecture is AI-first: the home page has one dominant question box, an equally visible emergency route, and four secondary destinations, including a dedicated path for helping someone else. The question is handed to the consultation page through one-time `sessionStorage`, removed immediately after reading, and never exposed in query parameters or browser history. Optional URL/image inputs, long guide explanations, source metadata, privacy detail, and report-status explanations use native progressive disclosure. Important warnings and next actions always remain visible without opening a disclosure.

Lucide icons are used as functional wayfinding for AI, URL inspection, OCR/QR, privacy, navigation, and result categories. Decorative instances are hidden from assistive technology; text remains the accessible label. License attribution is in `THIRD_PARTY_NOTICES.md`.

The browser interaction audit covers the shared menu and contrast controls, every consultation quick prompt, catalogue search/filter/reset/chips, every urgent incident selector, print behavior, report forward/back/consent/completion states, valid and invalid status lookup, sharing/fallback, invalid detail routes, AI-first primary actions, default-collapsed optional inputs, and progressive-disclosure contracts.

The UI/UX Pro Max refinement adds announced form error summaries, sequential heading hierarchy, sticky-navigation focus clearance, reduced-motion verification, stable non-jitter interaction feedback, a lightweight custom SVG at `assets/images/wargasiaga-safety-orbit.svg`, and four WebP illustrations. Responsive regression covers all ten routes at small-phone, phone-landscape, tablet, laptop, and desktop widths.

## Environment variables

The server reads `AI_API_KEY`, `AI_URL_KEY`, and `AI_MODEL_NAME` from the workspace-level `.env` one directory above this project. The browser never loads that file. Never rename the secret with a `VITE_` prefix or import it into browser code.

Before inference, the server masks common URLs, emails, phone numbers, long account/identity numbers, and contextual OTP/PIN/password values. Output is constrained to a JSON contract; card IDs and official destinations are intersected with server-side allowlists. A 15-second timeout, one transient retry, per-IP rate limit, and explicit rules fallback are active by default. URL triage now covers transport, IP hosts, Punycode/mixed scripts, unusual ports, deep subdomains, heavy encoding, recognized-brand/domain mismatch, sensitive pages on user-controlled hosting, and shortened destinations. It still does not query a threat-reputation service.

## Important product boundaries

- WargaSiaga is an independent guide, not OJK, Komdigi, police, a bank, or Scamwatch.
- The application cannot certify that a sender, number, account, image, or link is safe.
- URL inspection analyzes structure only and never visits the submitted destination. No threat-reputation feed is currently connected.
- OCR can misread text and does not establish whether a logo, screenshot, or sender is authentic.
- Community data is fictional demo content and marked unverified.
- All 13 educational records remain `draft` and visibly require Indonesian subject-matter review before publication.
- The report flow does not save or transmit data.
- External official destinations are clearly identified and open in a new tab.
- Contact details and service rules must be rechecked before public launch.

## Release gates still required

Before public launch, complete legal/privacy review of provider processing, expert-reviewed Indonesian scam and legitimate-message evaluation, assistive-technology testing, production observability, provider budget controls, and a product decision on licensed URL reputation intelligence. Community reports still require moderation ownership and a persistence/retention policy. The deterministic urgent path must remain available if AI, OCR, DNS, or any external service fails.

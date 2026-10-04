# WargaSiaga — Agent Handoff Entry Point

Read these files in order before changing the product:

1. `../WargaSiaga_03_Agent_Build_Guide.md`
2. `../WargaSiaga_02_Product_Plan.md`
3. `../WargaSiaga_01_Benchmark_and_Evidence.md`
4. `../wargasiaga-dev-report/23-new-agent-master-handoff.md`
5. `../wargasiaga-dev-report/24-latest-task-realistic-case-captures.md`
6. `../wargasiaga-dev-report/25-project-file-and-reference-map.md`
7. `../wargasiaga-dev-report/26-realistic-case-captures-complete-qa-and-integration.md`

All 13 realistic educational case captures (portrait 9:16 mobile UI captures)
have been generated, QA-approved, converted to WebP (<150 KB), and integrated
into the Vite asset graph in `assets/js/app.js` with deterministic SVG fallbacks.
All tests in `npm test` and `npm run test:all` pass 100%.

Never read, print, copy, or expose the real value of `AI_API_KEY`. The browser
must never call the model provider directly. Runtime secrets belong to the Node
server only.

From the workspace root (`D:\Work\Data Science\AI\Warga Siaga`):

```powershell
npm run dev
npm run test:all
```

The root package forwards commands to `wargasiaga-dev`.

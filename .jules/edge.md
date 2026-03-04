## 2025-02-24 - Optimizing Middleware Execution on Static Assets
**Learning:** Cloudflare edge caching for static assets (like `/cdn/` or `/_astro/`) is inefficient when global middleware intercepts every request to compute context (like fetching weather data), causing unnecessary CPU time and rate-limiting issues for external APIs.
**Action:** When implementing SSR middleware on Cloudflare, always early-return / short-circuit requests matching static asset paths or known proxy extensions to preserve external API quotas, minimize R2 hits, and reduce overall worker execution time.

## 2025-03-04 - Deduplicating Concurrent External Fetch Requests
**Learning:** During cache misses, concurrent requests reaching the same edge isolate will each trigger an independent `fetch()` to an external API like Open-Meteo, leading to rate limits or quota exhaustion despite caching headers.
**Action:** When requesting external APIs within Cloudflare Workers, wrap the `fetch` in a module-level `Promise` stored in a global `Map` (keyed by endpoint or variable string) to coalesce simultaneous requests into a single outgoing call. Ensure cleanup inside a `finally` block to prevent memory leaks and handle potential `throw` failures correctly.

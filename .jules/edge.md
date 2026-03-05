## 2025-03-05 - Missing Cache Response Headers on R2 Edge Proxy
**Learning:** Returning `object.body` from an R2 bucket using `new Response()` does not automatically attach the required cache headers. R2 requires `Cache-Control` to be explicitly added to the Response object, but `src/pages/cdn/[...path].ts` was already doing this correctly.
**Action:** Always verify R2 route caching headers are present on `GET` responses.
## 2025-03-05 - Try/Catch Fallbacks Around caches.default
**Learning:** `context.locals.runtime.caches.default` can throw errors (like 500s or timeouts) or be unavailable in certain environments/during transient issues, breaking the middleware execution if not caught.
**Action:** Always wrap `cache.match` and `cache.put` operations in `try/catch` blocks inside middleware to ensure fallback graceful degradation (hitting origin instead of crashing) instead of blocking the request.

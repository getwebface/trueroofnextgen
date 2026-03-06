/// <reference types="@cloudflare/workers-types" />
/**
 * CDN Image Proxy — src/pages/cdn/[...path].ts
 *
 * Serves objects from the Cloudflare R2 bucket bound as `IMAGES`.
 * URL pattern:  /cdn/<key>
 * Example:      /cdn/hero.webp  →  fetches the "hero.webp" key from R2
 *
 * Caching strategy:
 *  - Cache-Control: public, max-age=31536000, immutable
 *    → Cloudflare Edge caches the response globally; browsers cache for 1 year.
 *    → R2 is only billed for the very first cache miss per PoP (effectively free).
 *
 * To bust cache: rename the file (e.g. hero-v2.webp) or append a query-string
 * version to the URL in your templates.
 */

import type { APIRoute } from 'astro';

// Map common extensions to MIME types so the browser renders images correctly.
const MIME_TYPES: Record<string, string> = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    avif: 'image/avif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    // Also handle non-image assets you might store here
    css: 'text/css',
    js: 'application/javascript',
    woff2: 'font/woff2',
    // Video formats
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
};

// One year in seconds — used for the immutable Cache-Control header.
const ONE_YEAR = 31_536_000;

export const GET: APIRoute = async ({ request, params, locals }) => {
    // `params.path` contains everything after /cdn/ (the spread segment).
    const key = params.path;

    if (!key) {
        return new Response('Not found', { status: 404 });
    }

    const cache = locals.runtime?.caches?.default;

    // Attempt to serve from Edge Cache first
    if (cache) {
        try {
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
        } catch (err) {
            console.warn('[cdn] Cache match error:', err);
        }
    }

    // Retrieve the R2 bucket binding from the Cloudflare runtime env.
    const bucket = locals.runtime?.env?.IMAGES;

    if (!bucket) {
        // Fail gracefully in local dev (wrangler dev will inject the binding,
        // but a plain `astro dev` won't have it).
        console.warn('[cdn] R2 IMAGES binding not available — is this wrangler dev?');
        return new Response('Image storage not configured', { status: 503 });
    }

    let object: R2ObjectBody | null = null;

    try {
        object = await bucket.get(key);
    } catch (err) {
        console.error('[cdn] R2 get error:', err);
        return new Response('Internal server error', { status: 500 });
    }

    if (!object) {
        return new Response('Not found', { status: 404 });
    }

    // Derive MIME type from file extension, defaulting to octet-stream.
    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    // Build response headers.
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);

    // Forward any user-defined metadata from R2 (e.g. ETag set at upload time).
    if (object.httpMetadata?.contentType) {
        // R2 metadata wins over our extension-based guess when available.
        headers.set('Content-Type', object.httpMetadata.contentType);
    }

    // ETag allows downstream caches & browsers to validate staleness.
    if (object.httpEtag) {
        headers.set('ETag', object.httpEtag);
    }

    const response = new Response(object.body, { status: 200, headers });

    if (cache) {
        locals.runtime?.waitUntil?.(
            (async () => {
                try {
                    await cache.put(request, response.clone());
                } catch (err) {
                    console.warn('[cdn] Cache put error:', err);
                }
            })()
        );
    }

    return response;
};

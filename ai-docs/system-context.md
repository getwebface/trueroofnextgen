# System Context & Architecture

## Overview
This is a highly modular, data-driven Astro project for Melbourne roof tile restoration, designed to scale "brick-by-brick" via AI. It uses the Cloudflare SSR adapter.

## Framework & Styling
- **Framework:** Astro (latest)
- **Styling:** Tailwind CSS (utility classes for easy AI manipulation)
- **Language:** TypeScript for strict data typing

## Folder Structure
- `src/content/locations/`: Markdown/MDX files for locations (e.g., Wallan, Kilmore).
- `src/content/services/`: Markdown/MDX files for roofing services.
- `src/content/config.ts`: Zod schemas defining the structure of content collections.

## Dynamic Routing
- `src/pages/locations/[slug].astro`: Generates location pages.
- `src/pages/services/[slug].astro`: Generates service pages.

## Middleware
- `src/middleware.ts`: Configured for Cloudflare Workers. Intercepts requests, identifies user location via `cf.city`, and provides a `weatherContext` object to the global Astro context.

## Analytics
- `src/components/Analytics.astro`: Placeholder for PostHog integration.

## Service Boundaries
- **Strict Focus:** Melbourne Roof Tile Restoration only.
- **Reference:** See `ai-docs/service-boundaries.md` for a list of allowed and prohibited services.
- **Constraint:** Never mention "Roof Replacement."

## Daily Generation Logic (AI Instructions)
When generating new "bricks" (content files):
1. **Select Suburb:** Target Melbourne suburbs (e.g., Doncaster, Wallan, Kilmore).
2. **Verify Schema:** Adhere to `src/content/config.ts`.
3. **Restoration Context:** Use `localStats` to justify restoration (e.g., "Doncaster's 1970s tiles need re-pointing").
4. **Weather Mapping:** Map `weatherMode` to restoration headlines (e.g., `STORM_EMERGENCY` -> "Blocked Valleys in [Suburb]?").
5. **Internal Linking:** Link new locations to the core services (`tiled-restoration`, `metal-flashings`).

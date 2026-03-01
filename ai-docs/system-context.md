# System Context & Architecture

## Overview
This is a highly modular, data-driven Astro project for a roofing business, designed to scale "brick-by-brick" via AI. It uses the Cloudflare SSR adapter.

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

## How to Add New Content (Bricks)
To add a new location or service, simply create a new Markdown file in the respective `src/content/` directory following the Zod schema defined in `src/content/config.ts`. The dynamic routing will automatically generate the new page.

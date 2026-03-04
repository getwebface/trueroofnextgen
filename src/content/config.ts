import { defineCollection, z } from 'astro:content';

const locationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    postcode: z.string(),
    hero: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    // Deep Data Additions
    weatherOverrides: z.object({
      STORM_EMERGENCY: z.string().optional(),
      RAIN_ACTIVE: z.string().optional(),
      PREVENTATIVE: z.string().optional(),
      ROOF_RESTORATION: z.string().optional(),
    }).optional(),
    serviceFocus: z.array(z.string()).optional(),
    localStats: z.object({
      avgRoofAge: z.string().optional(),
      lastStormDate: z.string().optional(),
    }).optional(),
    // Local SEO Additions
    nearbySuburbs: z.array(z.string()).optional(),
    localCommonRoofTypes: z.array(z.string()).optional(),
    lastInspected: z.date().optional(),
  })
});

const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    // Enterprise CRO
    conversionGoal: z.string().optional(),
  })
});

// ─── FAQ Category enum ───────────────────────────────────────────
// Each FAQ must belong to exactly one category.
// Add new categories here when the content library grows.
export const FAQ_CATEGORIES = [
  'cost',          // pricing, quotes, value
  'process',       // how work is done, stages, timelines
  'emergency',     // storm, leaks, after-hours
  'maintenance',   // repointing, cleaning frequency, lifespan
  'insurance',     // claims, make-safe, reports
  'strata',        // property management, body corporates
  'diagnosis',     // "how do I know if…" questions
  'general',       // catch-all
] as const;
export type FAQCategory = typeof FAQ_CATEGORIES[number];

const faqCollection = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    answer: z.string(),

    // ── Classification (required for smart ranking) ──────────────
    // category: used to group FAQs visually in the compact UI
    category: z.enum(FAQ_CATEGORIES).default('general'),

    // services: which service slugs this FAQ is most relevant to
    // e.g. ['tiled-restoration', 'ridge-cap-rebedding-pointing']
    services: z.array(z.string()).default([]),

    // weatherEvents: which weather events make this FAQ more relevant
    // Matches WeatherEvent type in weatherProcessor.ts
    // e.g. ['HEAVY_RAIN', 'THUNDERSTORM']
    weatherEvents: z.array(z.string()).default([]),

    // tags: free-form keywords for future search / filtering
    tags: z.array(z.string()).default([]),

    // basePriority: 1 (low) – 10 (always show). Defaults to 5.
    // Higher values appear first when no weather context is available.
    basePriority: z.number().min(1).max(10).default(5),

    // ── Legacy optional fields ───────────────────────────────────
    locationSlug: z.string().optional(),
  })
});

export const collections = {
  'locations': locationsCollection,
  'services': servicesCollection,
  'faqs': faqCollection,
};

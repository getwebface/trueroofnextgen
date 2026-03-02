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

const faqCollection = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    locationSlug: z.string().optional(),
  })
});

export const collections = {
  'locations': locationsCollection,
  'services': servicesCollection,
  'faqs': faqCollection,
};

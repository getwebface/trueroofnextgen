import { defineCollection, z } from 'astro:content';

const locationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    postcode: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
  })
});

const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  })
});

export const collections = {
  'locations': locationsCollection,
  'services': servicesCollection,
};

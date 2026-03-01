import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  // Access Cloudflare specific properties from the request
  // context.locals.runtime is provided by the Cloudflare adapter
  const cf = context.locals.runtime?.cf;
  
  // Identify user's location via cf.city
  const city = cf?.city || 'Unknown';
  
  // Simulate weather logic based on Cloudflare data (or external API)
  // In a real scenario, you might call a weather API using the city/coordinates
  const isRaining = false; // Placeholder logic
  
  // Provide weatherContext to the global Astro context
  context.locals.weatherContext = {
    city,
    isRaining,
    temperature: 20 // Placeholder
  };

  return next();
});

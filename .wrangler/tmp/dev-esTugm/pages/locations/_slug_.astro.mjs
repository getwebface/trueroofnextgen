globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, r as renderComponent, a as renderTemplate, b as createAstro, m as maybeRenderHead, d as addAttribute } from '../../chunks/astro/server_D5t_fZ7D.mjs';
import { g as getEntry, a as getCollection, $ as $$MainLayout, Q as QuoteForm } from '../../chunks/QuoteForm_B3_uD9NX.mjs';
import { F as FAQAccordion } from '../../chunks/FAQAccordion_CmzmbXm1.mjs';
/* empty css                                     */
export { r as renderers } from '../../chunks/_@astro-renderers_DAonsJRm.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  if (!slug) return Astro2.redirect("/404");
  const location = await getEntry("locations", slug);
  if (!location) return Astro2.redirect("/404");
  const { Content } = await location.render();
  const { weatherContext } = Astro2.locals;
  const event = weatherContext?.event;
  weatherContext?.urgency || 1;
  const eventToMode = {
    HAIL_STORM: "STORM_EMERGENCY",
    THUNDERSTORM: "STORM_EMERGENCY",
    HIGH_WIND: "STORM_EMERGENCY",
    HEAVY_RAIN: "RAIN_ACTIVE",
    DRIZZLE: "RAIN_ACTIVE",
    FROST: "PREVENTATIVE",
    OVERCAST: "PREVENTATIVE",
    FOG: "PREVENTATIVE",
    CLEAR_MILD: "ROOF_RESTORATION",
    CLEAR_HOT: "ROOF_RESTORATION"
  };
  const overrideKey = event ? eventToMode[event] || "DEFAULT" : "DEFAULT";
  const overrideHeadline = location.data.weatherOverrides?.[overrideKey];
  const headline = overrideHeadline || location.data.title;
  const allFaqs = await getCollection("faqs");
  const locationFaqs = allFaqs.filter((f) => f.data.locationSlug === slug || !f.data.locationSlug).map((f) => ({ question: f.data.question, answer: f.data.answer }));
  const services = await getCollection("services");
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "data-astro-cid-g54tvpik": true }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<section class="hero-section" style="padding: 4rem 0 3.5rem;" data-astro-cid-g54tvpik> <div class="hero-content" data-astro-cid-g54tvpik> <div class="hero-badge" data-astro-cid-g54tvpik>📍 ${location.data.title} — Postcode ${location.data.postcode}</div> <h1 class="hero-headline" style="font-size: clamp(2rem, 5vw, 3.5rem);" data-astro-cid-g54tvpik> ${headline} </h1> <p class="hero-sub" style="max-width: 42rem;" data-astro-cid-g54tvpik>${location.data.description}</p> <div class="hero-ctas" data-astro-cid-g54tvpik> <a href="#quote" class="cta-primary" data-astro-cid-g54tvpik>📋 Get a Free Quote</a> <a href="tel:0400000000" class="cta-secondary" data-astro-cid-g54tvpik>📞 Call Us Now</a> </div> </div> </section> ${(location.data.localStats || location.data.localCommonRoofTypes) && renderTemplate`<section style="padding: 3rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);" data-astro-cid-g54tvpik> <div class="container" data-astro-cid-g54tvpik> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem;" data-astro-cid-g54tvpik> ${location.data.localStats?.avgRoofAge && renderTemplate`<div class="stat-card" data-astro-cid-g54tvpik> <div class="stat-value" data-astro-cid-g54tvpik>${location.data.localStats.avgRoofAge}</div> <div class="stat-label" data-astro-cid-g54tvpik>Avg Roof Age</div> </div>`} ${location.data.localStats?.lastStormDate && renderTemplate`<div class="stat-card" data-astro-cid-g54tvpik> <div class="stat-value" data-astro-cid-g54tvpik>${location.data.localStats.lastStormDate}</div> <div class="stat-label" data-astro-cid-g54tvpik>Last Major Storm</div> </div>`} ${location.data.localCommonRoofTypes && renderTemplate`<div class="stat-card" style="grid-column: span 2;" data-astro-cid-g54tvpik> <div class="stat-label" style="margin-bottom: 0.75rem;" data-astro-cid-g54tvpik>Common Roof Types</div> <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;" data-astro-cid-g54tvpik> ${location.data.localCommonRoofTypes.map((type) => renderTemplate`<span class="badge" data-astro-cid-g54tvpik>${type}</span>`)} </div> </div>`} </div> </div> </section>`}<section style="padding: 4rem 0;" data-astro-cid-g54tvpik> <div class="container" style="display: grid; grid-template-columns: 1fr 20rem; gap: 4rem; align-items: start;" data-astro-cid-g54tvpik> <div class="content-prose" data-astro-cid-g54tvpik> ${renderComponent($$result2, "Content", Content, { "data-astro-cid-g54tvpik": true })}  ${location.data.serviceFocus && renderTemplate`<div style="margin-top: 2.5rem;" data-astro-cid-g54tvpik> <h3 data-astro-cid-g54tvpik>Our Services in ${location.data.title}</h3> <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;" data-astro-cid-g54tvpik> ${location.data.serviceFocus.map((s) => renderTemplate`<span class="badge" data-astro-cid-g54tvpik>${s}</span>`)} </div> </div>`}  ${location.data.nearbySuburbs && location.data.nearbySuburbs.length > 0 && renderTemplate`<div style="margin-top: 2rem;" data-astro-cid-g54tvpik> <h3 data-astro-cid-g54tvpik>We Also Service Nearby</h3> <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;" data-astro-cid-g54tvpik> ${location.data.nearbySuburbs.map((suburb) => renderTemplate`<span class="badge" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.1);" data-astro-cid-g54tvpik>${suburb}</span>`)} </div> </div>`} </div>  <aside style="position: sticky; top: 6rem;" data-astro-cid-g54tvpik> <div class="glass-card" style="padding: 2rem; text-align: center;" data-astro-cid-g54tvpik> <div style="font-size: 2.5rem; margin-bottom: 0.75rem;" data-astro-cid-g54tvpik>📋</div> <h3 style="font-family: Outfit, sans-serif; font-weight: 800; font-size: 1.15rem; color: white; margin-bottom: 0.5rem;" data-astro-cid-g54tvpik>
Free Inspection in ${location.data.title} </h3> <p style="color: rgba(255,255,255,0.45); font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.25rem;" data-astro-cid-g54tvpik>
We service ${location.data.title} and surrounds.
</p> <a href="#quote" class="cta-primary" style="width: 100%; font-size: 0.9rem;" data-astro-cid-g54tvpik>Get Your Quote</a> </div>  <div class="glass-card" style="padding: 1.5rem; margin-top: 1rem;" data-astro-cid-g54tvpik> <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;" data-astro-cid-g54tvpik>Our Services</div> ${services.map((s) => renderTemplate`<a${addAttribute(`/services/${s.slug}`, "href")} style="display: block; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.87rem; padding: 0.375rem 0; transition: color 0.2s;" onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='rgba(255,255,255,0.6)'" data-astro-cid-g54tvpik>${s.data.title}</a>`)} </div> </aside> </div> </section> ${locationFaqs.length > 0 && renderTemplate`<section class="section-dark" style="padding: 4rem 0;" data-astro-cid-g54tvpik> <div class="container" style="max-width: 48rem;" data-astro-cid-g54tvpik> <h2 class="section-heading" style="text-align: center; margin-bottom: 2rem;" data-astro-cid-g54tvpik>
FAQs for <span class="accent-text" data-astro-cid-g54tvpik>${location.data.title}</span> </h2> ${renderComponent($$result2, "FAQAccordion", FAQAccordion, { "client:load": true, "items": locationFaqs, "client:component-hydration": "load", "client:component-path": "/app/src/components/FAQAccordion.tsx", "client:component-export": "default", "data-astro-cid-g54tvpik": true })} </div> </section>`}<section id="quote" class="quote-section" data-astro-cid-g54tvpik> <div class="container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" data-astro-cid-g54tvpik> <div data-astro-cid-g54tvpik> <h2 class="section-heading" style="margin-bottom: 1rem;" data-astro-cid-g54tvpik>
Roof Restoration in<br data-astro-cid-g54tvpik><span class="accent-text" data-astro-cid-g54tvpik>${location.data.title}</span> </h2> <p style="color: rgba(255,255,255,0.5); font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem;" data-astro-cid-g54tvpik>
Get a free inspection and detailed quote for your ${location.data.title} property.
</p> <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;" data-astro-cid-g54tvpik> <span class="badge" data-astro-cid-g54tvpik>✅ Serving ${location.data.postcode}</span> <span class="badge" data-astro-cid-g54tvpik>✅ Free Inspection</span> </div> </div> ${renderComponent($$result2, "QuoteForm", QuoteForm, { "client:load": true, "ctx": weatherContext, "client:component-hydration": "load", "client:component-path": "/app/src/components/QuoteForm.tsx", "client:component-export": "default", "data-astro-cid-g54tvpik": true })} </div> </section> ` })} `;
}, "/app/src/pages/locations/[slug].astro", void 0);

const $$file = "/app/src/pages/locations/[slug].astro";
const $$url = "/locations/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

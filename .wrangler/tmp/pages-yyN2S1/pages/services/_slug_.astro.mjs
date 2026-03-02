globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, r as renderComponent, a as renderTemplate, b as createAstro, m as maybeRenderHead, d as addAttribute } from '../../chunks/astro/server_D5t_fZ7D.mjs';
import { g as getEntry, a as getCollection, $ as $$MainLayout, Q as QuoteForm } from '../../chunks/QuoteForm_B3_uD9NX.mjs';
/* empty css                                     */
export { r as renderers } from '../../chunks/_@astro-renderers_DAonsJRm.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  if (!slug) return Astro2.redirect("/404");
  const service = await getEntry("services", slug);
  if (!service) return Astro2.redirect("/404");
  const { Content } = await service.render();
  const { weatherContext } = Astro2.locals;
  const urgency = weatherContext?.urgency || 1;
  weatherContext?.city || "Melbourne";
  const allServices = await getCollection("services");
  const relatedServices = allServices.filter((s) => s.slug !== slug);
  const iconMap = {
    droplet: "\u{1F4A7}",
    wrench: "\u{1F527}",
    "shield-check": "\u{1F6E1}\uFE0F"
  };
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "data-astro-cid-tcy35dad": true }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<section class="hero-section" style="padding: 4rem 0 3.5rem;" data-astro-cid-tcy35dad> <div class="hero-content" data-astro-cid-tcy35dad> <div class="hero-badge" data-astro-cid-tcy35dad> ${iconMap[service.data.icon || ""] || "\u{1F3E0}"} ${service.data.title} </div> <h1 class="hero-headline" style="font-size: clamp(2rem, 5vw, 3.5rem);" data-astro-cid-tcy35dad> ${service.data.title} </h1> <p class="hero-sub" style="max-width: 42rem;" data-astro-cid-tcy35dad> ${service.data.description} </p> <div class="hero-ctas" data-astro-cid-tcy35dad> <a href="#quote" class="cta-primary" data-astro-cid-tcy35dad> ${urgency >= 4 ? "\u{1F6A8} Emergency Booking" : "\u{1F4CB} Get a Free Quote"} </a> <a href="tel:0400000000" class="cta-secondary" data-astro-cid-tcy35dad>📞 Call Us Now</a> </div> </div> </section> <section style="padding: 4rem 0;" data-astro-cid-tcy35dad> <div class="container" style="display: grid; grid-template-columns: 1fr 20rem; gap: 4rem; align-items: start;" data-astro-cid-tcy35dad>  <div class="content-prose" data-astro-cid-tcy35dad> ${renderComponent($$result2, "Content", Content, { "data-astro-cid-tcy35dad": true })} </div>  <aside style="position: sticky; top: 6rem;" data-astro-cid-tcy35dad> <div class="glass-card" style="padding: 2rem; text-align: center;" data-astro-cid-tcy35dad> <div style="font-size: 2.5rem; margin-bottom: 0.75rem;" data-astro-cid-tcy35dad>📋</div> <h3 style="font-family: Outfit, sans-serif; font-weight: 800; font-size: 1.15rem; color: white; margin-bottom: 0.5rem;" data-astro-cid-tcy35dad>
Free Roof Inspection
</h3> <p style="color: rgba(255,255,255,0.45); font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.25rem;" data-astro-cid-tcy35dad>
No obligation quote with a detailed condition report.
</p> <a href="#quote" class="cta-primary" style="width: 100%; font-size: 0.9rem;" data-astro-cid-tcy35dad>
Get Your Quote
</a> <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 0.5rem;" data-astro-cid-tcy35dad> <span class="badge" style="font-size: 0.7rem;" data-astro-cid-tcy35dad>✅ Free</span> <span class="badge" style="font-size: 0.7rem;" data-astro-cid-tcy35dad>✅ Same Day</span> </div> </div>  <div class="glass-card" style="padding: 1.5rem; margin-top: 1rem; display: flex; align-items: center; gap: 0.75rem;" data-astro-cid-tcy35dad> <span style="font-size: 1.5rem;" data-astro-cid-tcy35dad>📞</span> <div data-astro-cid-tcy35dad> <div style="font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.04em;" data-astro-cid-tcy35dad>Call Anytime</div> <a href="tel:0400000000" style="font-family: Outfit, sans-serif; font-weight: 800; font-size: 1.1rem; color: white; text-decoration: none;" data-astro-cid-tcy35dad>0400 000 000</a> </div> </div> </aside> </div> </section> ${relatedServices.length > 0 && renderTemplate`<section class="section-dark" style="padding: 4rem 0;" data-astro-cid-tcy35dad> <div class="container" data-astro-cid-tcy35dad> <h2 class="section-heading" style="margin-bottom: 2rem;" data-astro-cid-tcy35dad>Other <span class="accent-text" data-astro-cid-tcy35dad>Services</span></h2> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;" data-astro-cid-tcy35dad> ${relatedServices.map((s) => renderTemplate`<a${addAttribute(`/services/${s.slug}`, "href")} class="service-card" data-astro-cid-tcy35dad> <div class="service-icon" data-astro-cid-tcy35dad>${iconMap[s.data.icon || ""] || "\u{1F3E0}"}</div> <h3 data-astro-cid-tcy35dad>${s.data.title}</h3> <p data-astro-cid-tcy35dad>${s.data.description}</p> <span class="card-link" data-astro-cid-tcy35dad>Learn More →</span> </a>`)} </div> </div> </section>`}<section id="quote" class="quote-section" data-astro-cid-tcy35dad> <div class="container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" data-astro-cid-tcy35dad> <div data-astro-cid-tcy35dad> <h2 class="section-heading" style="margin-bottom: 1rem;" data-astro-cid-tcy35dad>
Get a Quote for<br data-astro-cid-tcy35dad><span class="accent-text" data-astro-cid-tcy35dad>${service.data.title}</span> </h2> <p style="color: rgba(255,255,255,0.5); font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem;" data-astro-cid-tcy35dad>
Tell us about your roof and we'll get back to you with a detailed quote within 2 hours.
</p> <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;" data-astro-cid-tcy35dad> <span class="badge" data-astro-cid-tcy35dad>✅ Free Inspections</span> <span class="badge" data-astro-cid-tcy35dad>✅ No Obligation</span> </div> </div> ${renderComponent($$result2, "QuoteForm", QuoteForm, { "client:load": true, "ctx": weatherContext, "client:component-hydration": "load", "client:component-path": "/app/src/components/QuoteForm.tsx", "client:component-export": "default", "data-astro-cid-tcy35dad": true })} </div> </section> ` })} `;
}, "/app/src/pages/services/[slug].astro", void 0);

const $$file = "/app/src/pages/services/[slug].astro";
const $$url = "/services/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

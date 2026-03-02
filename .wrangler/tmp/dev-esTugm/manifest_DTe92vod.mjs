globalThis.process ??= {}; globalThis.process.env ??= {};
import { p as decodeKey } from './chunks/astro/server_D5t_fZ7D.mjs';
import './chunks/astro-designed-error-pages_Dm97gQfD.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_BBYwSUNe.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///app/","cacheDir":"file:///app/node_modules/.astro/","outDir":"file:///app/dist/","srcDir":"file:///app/src/","publicDir":"file:///app/public/","buildClientDir":"file:///app/dist/","buildServerDir":"file:///app/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.hfOlgL-_.css"},{"type":"inline","content":"@media(max-width:768px){.container[data-astro-cid-g54tvpik]{grid-template-columns:1fr!important}aside[data-astro-cid-g54tvpik]{position:static!important}}\n"}],"routeData":{"route":"/locations/[slug]","isIndex":false,"type":"page","pattern":"^\\/locations\\/([^/]+?)\\/?$","segments":[[{"content":"locations","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/locations/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.hfOlgL-_.css"},{"type":"inline","content":"@media(max-width:768px){.container[data-astro-cid-tcy35dad]{grid-template-columns:1fr!important}aside[data-astro-cid-tcy35dad]{position:static!important}}\n"}],"routeData":{"route":"/services/[slug]","isIndex":false,"type":"page","pattern":"^\\/services\\/([^/]+?)\\/?$","segments":[[{"content":"services","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/services/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.hfOlgL-_.css"},{"type":"inline","content":".service-card[data-astro-cid-j7pv25f6].featured{border-top:2px solid var(--color-brand-orange)}.service-hint[data-astro-cid-j7pv25f6]{font-size:.78rem;color:#ffffff73;font-style:italic;margin-bottom:.75rem;padding:.375rem .75rem;background:#ffffff08;border-radius:.5rem;border-left:2px solid rgba(249,115,22,.4)}@media(max-width:768px){#quote[data-astro-cid-j7pv25f6] .container[data-astro-cid-j7pv25f6]{grid-template-columns:1fr!important;gap:2rem!important}}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/app/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/app/src/pages/locations/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/locations/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/app/src/pages/services/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/services/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/locations/[slug]@_@astro":"pages/locations/_slug_.astro.mjs","\u0000@astro-page:src/pages/services/[slug]@_@astro":"pages/services/_slug_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DTe92vod.mjs","/app/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/app/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BW2nmGRT.mjs","/app/.astro/content-assets.mjs":"chunks/content-assets_XqCgPAV2.mjs","/app/.astro/content-modules.mjs":"chunks/content-modules_Bvq7llv8.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_DKqYf7zb.mjs","/app/src/components/FAQAccordion.tsx":"_astro/FAQAccordion.Bvm63OQ2.js","/app/src/components/QuoteForm.tsx":"_astro/QuoteForm.amCoMkJx.js","/app/src/components/WeatherHero.tsx":"_astro/WeatherHero.DCPR6GKW.js","@astrojs/react/client.js":"_astro/client.Dc9Vh3na.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/index.hfOlgL-_.css","/_astro/FAQAccordion.Bvm63OQ2.js","/_astro/QuoteForm.amCoMkJx.js","/_astro/WeatherHero.DCPR6GKW.js","/_astro/client.Dc9Vh3na.js","/_astro/index.DiEladB3.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/proxy.D7Ec1ohE.js","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/_worker.js/_astro/index.hfOlgL-_.css","/_worker.js/pages/_image.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/chunks/FAQAccordion_CmzmbXm1.mjs","/_worker.js/chunks/QuoteForm_B3_uD9NX.mjs","/_worker.js/chunks/_@astro-renderers_DAonsJRm.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_Db1ukTpj.mjs","/_worker.js/chunks/_astro_assets_CD6EeP6U.mjs","/_worker.js/chunks/_astro_data-layer-content_DKqYf7zb.mjs","/_worker.js/chunks/astro-designed-error-pages_Dm97gQfD.mjs","/_worker.js/chunks/astro_CiQTwkvM.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/consts_DBS1dnOp.mjs","/_worker.js/chunks/content-assets_XqCgPAV2.mjs","/_worker.js/chunks/content-modules_Bvq7llv8.mjs","/_worker.js/chunks/index_DRRaTh15.mjs","/_worker.js/chunks/noop-middleware_BBYwSUNe.mjs","/_worker.js/chunks/parse_CDBk4F85.mjs","/_worker.js/chunks/path_BgNISshD.mjs","/_worker.js/chunks/remote_CrdlObHx.mjs","/_worker.js/chunks/sharp_BW2nmGRT.mjs","/_worker.js/pages/locations/_slug_.astro.mjs","/_worker.js/pages/services/_slug_.astro.mjs","/_worker.js/chunks/astro/server_D5t_fZ7D.mjs"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"N97ggOxtY6zi494IH3+boqGt7wnzplcNLOtcWTB8ceA=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };

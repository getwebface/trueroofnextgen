// src/utils/faqRanker.ts
// TrueRoof NextGen — Smart FAQ Ranking Engine
//
// Scores FAQs based on:
//  1. Weather event match     (+40 per matched event, top urgency events score higher)
//  2. Service relevance match (+20 per matched service slug)
//  3. Base priority           (1–10 as defined in frontmatter)
//  4. Seasonal boost          (+5 for season-relevant content)
//
// This file never hardcodes which FAQ should appear first — all
// ordering is driven by FAQ frontmatter + live WeatherContext.

import type { WeatherEvent, WeatherContext } from './weatherProcessor';

// ── Weather urgency weights — higher = more important to surface ──
const WEATHER_URGENCY_WEIGHTS: Record<WeatherEvent, number> = {
    HAIL_STORM: 5,
    THUNDERSTORM: 4,
    HEAVY_RAIN: 4,
    HIGH_WIND: 4,
    DRIZZLE: 3,
    FROST: 3,
    CLEAR_HOT: 2,
    OVERCAST: 1,
    FOG: 1,
    CLEAR_MILD: 1,
    DEFAULT: 0,
};

// ── Input: what each ranked FAQ looks like ──
export interface RankableFAQ {
    slug: string;
    question: string;
    answer: string;
    category: string;
    services: string[];
    weatherEvents: string[];
    tags: string[];
    basePriority: number;
}

// ── Output: FAQ with computed score and boost reason ──
export interface RankedFAQ extends RankableFAQ {
    score: number;
    /** Short label shown in UI to explain WHY this FAQ is surfaced now */
    boostReason?: string;
    /** Whether this FAQ was boosted by weather context */
    weatherBoosted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// rankFAQs
//
// @param faqs      List of all FAQs from the content collection
// @param ctx       Live WeatherContext (may be undefined server-side)
// @param pageServiceSlugs  Optional slug(s) of the current page's service(s)
//                          e.g. ['tiled-restoration'] on the restoration page
// @returns         FAQs sorted by score descending
// ─────────────────────────────────────────────────────────────────────────────
export function rankFAQs(
    faqs: RankableFAQ[],
    ctx?: WeatherContext | null,
    pageServiceSlugs: string[] = [],
): RankedFAQ[] {

    const activeEvent: WeatherEvent | null = ctx?.event ?? null;
    const secondaryEvent: WeatherEvent | null = ctx?.secondaryEvent ?? null;
    const activeSeason = ctx?.season ?? null;
    const topServiceWeights = new Map(
        ctx?.services.map(s => [s.slug, s.weight]) ?? []
    );

    const scored: RankedFAQ[] = faqs.map(faq => {
        let score = faq.basePriority * 2; // base score (2–20 range)
        let boostReason: string | undefined;
        let weatherBoosted = false;

        // ── 1. Primary weather event match ───────────────────────────────────────
        if (activeEvent && faq.weatherEvents.includes(activeEvent)) {
            const urgencyWeight = WEATHER_URGENCY_WEIGHTS[activeEvent];
            const boost = 40 + urgencyWeight * 6;
            score += boost;
            weatherBoosted = true;
            boostReason = buildBoostReason(activeEvent);
        }

        // ── 2. Secondary weather event match (smaller boost) ─────────────────────
        if (secondaryEvent && faq.weatherEvents.includes(secondaryEvent)) {
            const urgencyWeight = WEATHER_URGENCY_WEIGHTS[secondaryEvent];
            score += 20 + urgencyWeight * 3;
            weatherBoosted = true;
            if (!boostReason) boostReason = buildBoostReason(secondaryEvent);
        }

        // ── 3. Top-ranked services from weather context ───────────────────────────
        for (const svcSlug of faq.services) {
            const weight = topServiceWeights.get(svcSlug) ?? 0;
            score += weight * 2; // weight is 0–10, so max +20
        }

        // ── 4. Page-level service match (e.g. on /services/metal-flashings) ───────
        for (const pageSlug of pageServiceSlugs) {
            if (faq.services.includes(pageSlug)) {
                score += 15;
                if (!boostReason) boostReason = 'Relevant to this service';
            }
        }

        // ── 5. Seasonal boost ─────────────────────────────────────────────────────
        if (activeSeason) {
            const isSeason = checkSeasonalRelevance(faq, activeSeason);
            if (isSeason) score += 5;
        }

        return { ...faq, score, boostReason, weatherBoosted };
    });

    return scored.sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// groupFAQsByCategory
//
// Groups ranked FAQs by their category, preserving rank order within each
// group. Returns categories in order of their highest-scored FAQ.
// ─────────────────────────────────────────────────────────────────────────────
export function groupFAQsByCategory(
    rankedFaqs: RankedFAQ[],
): Map<string, RankedFAQ[]> {
    const groups = new Map<string, RankedFAQ[]>();

    for (const faq of rankedFaqs) {
        const cat = faq.category || 'general';
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat)!.push(faq);
    }

    return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildBoostReason(event: WeatherEvent): string {
    const reasons: Partial<Record<WeatherEvent, string>> = {
        HAIL_STORM: '🚨 Hail active now',
        THUNDERSTORM: '⛈️ Storm active now',
        HEAVY_RAIN: '🌧️ Heavy rain now',
        DRIZZLE: '🌦️ Rain today',
        HIGH_WIND: '💨 High winds now',
        FROST: '❄️ Frost conditions',
        CLEAR_HOT: '☀️ Hot weather',
        CLEAR_MILD: '🌤️ Ideal conditions',
        OVERCAST: '☁️ Overcast today',
        FOG: '🌫️ Foggy today',
    };
    return reasons[event] ?? 'Current conditions';
}

type Season = 'SUMMER' | 'AUTUMN' | 'WINTER' | 'SPRING';

function checkSeasonalRelevance(faq: RankableFAQ, season: Season): boolean {
    const seasonTags: Record<Season, string[]> = {
        SUMMER: ['cleaning', 'algae', 'moss', 'heat', 'UV', 'summer'],
        AUTUMN: ['maintenance', 'prevention', 'pre-winter', 'autumn'],
        WINTER: ['leak', 'emergency', 'storm', 'rain', 'frost', 'winter'],
        SPRING: ['restoration', 'post-winter', 'assessment', 'spring'],
    };
    const relevantTags = seasonTags[season];
    return faq.tags.some(t => relevantTags.some(rt => t.toLowerCase().includes(rt.toLowerCase())));
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY_LABELS — human-readable names for each category slug.
// When you add a new category to FAQ_CATEGORIES in config.ts,
// add a matching entry here.
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
    cost: 'Pricing & Quotes',
    process: 'Our Process',
    emergency: 'Emergency Response',
    maintenance: 'Maintenance & Lifespan',
    insurance: 'Insurance & Claims',
    strata: 'Strata & Body Corporate',
    diagnosis: 'Diagnosing Problems',
    general: 'General Questions',
};

// src/components/SmartFAQAccordion.tsx
// TrueRoof NextGen — Smart FAQ Accordion
//
// Features:
//  • Compact by default: shows INITIAL_VISIBLE FAQs, expandable with "Show More"
//  • Weather-boosted FAQs surface with an animated contextual badge
//  • Optional category filter tabs — auto-generated from the data, no hardcoding
//  • Schema.org FAQPage JSON-LD always includes ALL FAQs for full SEO coverage
//  • Memoized to avoid re-renders

import { useState, useMemo, memo, type FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RankedFAQ } from '../utils/faqRanker';
import { groupFAQsByCategory, CATEGORY_LABELS } from '../utils/faqRanker';

// ── Config ───────────────────────────────────────────────────────────────────
const INITIAL_VISIBLE = 5; // FAQs shown before "Show More"

// ── Props ────────────────────────────────────────────────────────────────────
interface SmartFAQAccordionProps {
    /** All FAQs, pre-ranked by the faqRanker utility (server-side) */
    items: RankedFAQ[];
    /** Optional: current weather event label for the category filter badge */
    weatherEvent?: string;
}

// ── Category Tab ─────────────────────────────────────────────────────────────
const CategoryTab: FC<{
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}> = ({ label, count, active, onClick }) => (
    <button
        className={`faq-tab ${active ? 'active' : ''}`}
        onClick={onClick}
        type="button"
        role="tab"
        aria-selected={active}
    >
        {label}
        <span className="faq-tab-count">{count}</span>
    </button>
);

// ── Single FAQ Row ────────────────────────────────────────────────────────────
const FAQRow: FC<{
    faq: RankedFAQ;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ faq, index, isOpen, onToggle }) => {
    const qId = `faq-q-${index}`;
    const aId = `faq-a-${index}`;

    return (
        <div className={`faq-row ${isOpen ? 'open' : ''} ${faq.weatherBoosted ? 'weather-boosted' : ''}`}>
            {/* Weather relevance badge — only shown when actively boosted */}
            {faq.weatherBoosted && faq.boostReason && (
                <div className="faq-boost-badge" aria-hidden="true">
                    {faq.boostReason}
                </div>
            )}

            <button
                id={qId}
                className="faq-row-trigger"
                onClick={() => {
                    onToggle();
                    if (typeof window !== 'undefined' && (window as any).trackEvent) {
                        (window as any).trackEvent('toggled_smart_faq', {
                            question: faq.question,
                            category: faq.category,
                            weatherBoosted: faq.weatherBoosted,
                            action: isOpen ? 'close' : 'open',
                        });
                    }
                }}
                aria-expanded={isOpen}
                aria-controls={aId}
            >
                <span className="faq-row-q">{faq.question}</span>
                <svg
                    className={`faq-row-chevron ${isOpen ? 'rotated' : ''}`}
                    width="18" height="18"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={aId}
                        role="region"
                        aria-labelledby={qId}
                        className="faq-row-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="faq-row-answer-inner">{faq.answer}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SmartFAQAccordion: FC<SmartFAQAccordionProps> = ({ items, weatherEvent }) => {
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [expanded, setExpanded] = useState(false);

    // Build category tabs from the ranked data — auto, not hardcoded
    const categoryGroups = useMemo(() => groupFAQsByCategory(items), [items]);
    const categoryKeys = useMemo(() => {
        // ⚡ Bolt Optimization: Pre-compute which categories contain boosted FAQs
        // This reduces the sort comparator from O(M) lookup to O(1) Set check,
        // eliminating the `.some()` array scan on every comparison iteration.
        const boostedCategories = new Set<string>();
        for (const [cat, group] of categoryGroups.entries()) {
            if (group.some(f => f.weatherBoosted)) {
                boostedCategories.add(cat);
            }
        }

        // Order: categories that have weather-boosted FAQs first, then by count
        const keys = [...categoryGroups.keys()];
        return keys.sort((a, b) => {
            const aBoosted = boostedCategories.has(a);
            const bBoosted = boostedCategories.has(b);
            if (aBoosted && !bBoosted) return -1;
            if (!aBoosted && bBoosted) return 1;
            return (categoryGroups.get(b)?.length ?? 0) - (categoryGroups.get(a)?.length ?? 0);
        });
    }, [categoryGroups]);

    // Which FAQs are actually visible based on category filter
    const filtered = useMemo(() => {
        if (activeCategory === 'all') return items;
        return items.filter(f => f.category === activeCategory);
    }, [items, activeCategory]);

    // Slice to initial visible unless user has expanded
    const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
    const hasMore = filtered.length > INITIAL_VISIBLE;

    // Show category tabs only when there are ≥2 non-'general' categories
    const showTabs = categoryKeys.filter(k => k !== 'general').length >= 2;

    const handleToggle = (id: string) => {
        setOpenIndex(prev => (prev === id ? null : id));
    };

    return (
        <div className="smart-faq">
            {/* ── Category filter tabs ── */}
            {showTabs && (
                <div className="faq-tabs" role="tablist" aria-label="FAQ categories">
                    <CategoryTab
                        label="All"
                        count={items.length}
                        active={activeCategory === 'all'}
                        onClick={() => { setActiveCategory('all'); setExpanded(false); setOpenIndex(null); }}
                    />
                    {categoryKeys.map(cat => {
                        const group = categoryGroups.get(cat)!;
                        const hasBoosted = group.some(f => f.weatherBoosted);
                        return (
                            <CategoryTab
                                key={cat}
                                label={(CATEGORY_LABELS[cat] ?? cat) + (hasBoosted ? ' ●' : '')}
                                count={group.length}
                                active={activeCategory === cat}
                                onClick={() => { setActiveCategory(cat); setExpanded(false); setOpenIndex(null); }}
                            />
                        );
                    })}
                </div>
            )}

            {/* ── FAQ rows ── */}
            <div className="faq-list">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {visible.map((faq, i) => {
                            const uid = `${faq.slug}-${i}`;
                            return (
                                <FAQRow
                                    key={uid}
                                    faq={faq}
                                    index={i}
                                    isOpen={openIndex === uid}
                                    onToggle={() => handleToggle(uid)}
                                />
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Show More / Less toggle ── */}
            {hasMore && (
                <button
                    className="faq-show-more"
                    onClick={() => setExpanded(e => !e)}
                    type="button"
                >
                    {expanded
                        ? `↑ Show less`
                        : `↓ Show ${filtered.length - INITIAL_VISIBLE} more question${filtered.length - INITIAL_VISIBLE === 1 ? '' : 's'}`}
                </button>
            )}
        </div>
    );
};

export default memo(SmartFAQAccordion);

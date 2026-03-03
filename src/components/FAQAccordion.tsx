import { useState, memo, type FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

const FAQAccordion: FC<FAQAccordionProps> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div>
            {items.map((item, i) => (
                <div key={i} className="faq-item">
                    <button
                        className="faq-question"
                        onClick={() => {
                            setOpenIndex(openIndex === i ? null : i);
                            if (typeof window !== 'undefined' && (window as any).trackEvent) {
                                (window as any).trackEvent('toggled_faq_accordion', {
                                    question: item.question,
                                    index: i,
                                    action: openIndex === i ? 'close' : 'open'
                                });
                            }
                        }}
                        aria-expanded={openIndex === i}
                    >
                        <span>{item.question}</span>
                        <svg
                            className={`faq-chevron ${openIndex === i ? 'open' : ''}`}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    <AnimatePresence initial={false}>
                        {openIndex === i && (
                            <motion.div
                                className="faq-answer"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <div style={{ paddingBottom: '1.25rem' }}>
                                    {item.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            {/* Schema.org FAQ structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: items.map(item => ({
                            '@type': 'Question',
                            name: item.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: item.answer,
                            },
                        })),
                    }),
                }}
            />
        </div>
    );
};

// ⚡ Bolt: Memoize FAQ Accordion to prevent re-renders when static FAQ content hasn't changed
export default memo(FAQAccordion);

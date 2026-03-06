import { useState, useRef, useEffect, memo, type FC, type FormEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { WeatherContext } from '../utils/weatherProcessor';
import currentCampaign from '../data/active-campaign.json';

interface QuoteFormProps {
    ctx: WeatherContext | null;
}

const services = [
    'Full Tile Restoration',
    'Roof Tile Cleaning',
    'Re-bedding & Flexi-Pointing',
    'Metal Flashing Repairs',
    'Valley Iron Replacement',
    'Emergency Leak Repair',
    'Protective Coating',
    'Free Roof Inspection',
];

// 🧠 Convert UX: Benefit-driven CTAs outperform generic "Request a Quote" by focusing on the value to the user.
// Map urgency to CTA labels
const urgencyCTAs: Record<number, string> = {
    5: '🚨 Get Emergency Quote Now',
    4: '⚡ Get Urgent Inspection',
    3: '📋 Get My Free Inspection',
    2: 'Get a Fair Quote 👍',
    1: 'Get a Fair Quote 👍',
};

const QuoteForm: FC<QuoteFormProps> = ({ ctx }) => {
    const shouldReduceMotion = useReducedMotion();
    const urgency = ctx?.urgency || 1;
    const city = ctx?.city || 'Melbourne';
    const topServiceName = ctx?.topService?.slug
        ? { 'metal-flashings': 'Metal Flashing Repairs', 'cleaning': 'Roof Tile Cleaning', 'tiled-restoration': 'Full Tile Restoration' }[ctx.topService.slug] || ''
        : '';

    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        suburb: city,
        service: urgency >= 4 ? 'Emergency Leak Repair' : topServiceName,
        message: '',
    });
    const [hasTrackedStart, setHasTrackedStart] = useState(false);
    const lastActiveField = useRef<string | null>(null);
    const trackingDataRef = useRef({ hasTrackedStart, submitted, urgency, service: formData.service, suburb: formData.suburb });

    useEffect(() => {
        trackingDataRef.current = { hasTrackedStart, submitted, urgency, service: formData.service, suburb: formData.suburb };
    }, [hasTrackedStart, submitted, urgency, formData.service, formData.suburb]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentData = trackingDataRef.current;
            if (currentData.hasTrackedStart && !currentData.submitted && lastActiveField.current) {
                if (typeof window !== 'undefined' && (window as any).posthog) {
                    (window as any).posthog.capture('abandoned_quote_form', {
                        last_field_interacted: lastActiveField.current,
                        urgency: currentData.urgency,
                        service: currentData.service,
                        suburb: currentData.suburb
                    });
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            handleBeforeUnload(); // trigger on unmount
        };
    }, []);

    const ctaText = urgencyCTAs[urgency] || urgencyCTAs[1];

    let messagePlaceholder = "Describe the issue or what you've noticed...";
    if (ctx) {
        if (ctx.urgency >= 4) {
            messagePlaceholder = "Please describe the urgent damage (e.g., location of leaks, missing tiles) so we can prepare the right materials...";
        } else if (ctx.event === 'HEAVY_RAIN' || ctx.event === 'DRIZZLE') {
            messagePlaceholder = "Noticing any specific leaks or damp spots today? Let us know which rooms are affected...";
        } else if (ctx.event === 'HIGH_WIND') {
            messagePlaceholder = "Did you hear any rattling tiles or notice displaced flashings from the wind?";
        } else if (ctx.event === 'FROST') {
            messagePlaceholder = "Noticing any cracked mortar or pointing after the cold nights?";
        } else if (ctx.season === 'AUTUMN') {
            messagePlaceholder = "Looking for a pre-winter checkup? Let us know if you have specific concerns like blocked valleys...";
        } else if (ctx.season === 'SPRING') {
            messagePlaceholder = "Looking for a post-winter checkup? Let us know if you've noticed any new damage...";
        }
    }

    const campaignText = currentCampaign.code ? `Have promo code ${currentCampaign.code}? Let us know when we call. Valid until ${currentCampaign.expiryDate}.` : '';
    const messageHelperText = ctx?.urgency && ctx.urgency >= 4
        ? "We prioritize emergency call-outs. Please provide detail so we can respond effectively."
        : `${ctx?.copyHints?.seasonalTip ? ctx.copyHints.seasonalTip + ' ' : ''}${campaignText}`.trim();

    const handleFocus = (fieldName: string) => {
        lastActiveField.current = fieldName;
        if (!hasTrackedStart) {
            setHasTrackedStart(true);
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
                (window as any).trackEvent('quote_form_start', {
                    urgency,
                    event: ctx?.event,
                    season: ctx?.season,
                });
            }
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSending(true);

        if (typeof window !== 'undefined' && (window as any).trackEvent) {
            (window as any).trackEvent('quote_form_submit', {
                urgency,
                event: ctx?.event,
                season: ctx?.season,
                timeOfDay: ctx?.timeOfDay,
                service: formData.service,
                suburb: formData.suburb,
            });
        }

        // Simulate async submit
        setTimeout(() => {
            setSending(false);
            setSubmitted(true);
        }, 800);
    };

    return (
        <div className="quote-form-card">
            <AnimatePresence mode="wait">
                {submitted ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: '0.75rem' }}>
                            {urgency >= 4 ? 'On It — We\'ll Call You Shortly' : 'Thanks! We\'ll Be in Touch.'}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            {urgency >= 4
                                ? 'Given current conditions, we\'ll call you back within the hour. For immediate emergencies, call us now.'
                                : 'One of our team will contact you within 2 hours during business hours.'}
                        </p>
                        <a href="tel:0400000000" className="cta-primary" onClick={() => {
                            if (typeof window !== 'undefined' && (window as any).trackEvent) {
                                (window as any).trackEvent('clicked_quote_success_call_cta', { urgency });
                            }
                        }}>
                            📞 {urgency >= 4 ? 'Call Emergency Line' : 'Call Us Now'}
                        </a>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: '0.25rem' }}>
                            {urgency >= 4 ? 'Get Urgent Help' : 'Request a Free Quote'}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.87rem', marginBottom: '1.75rem' }}>
                            {urgency >= 4
                                ? 'Submit now — we\'ll call back within the hour.'
                                : 'No obligation. We\'ll get back to you within 2 hours.'}
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="q-name">Your Name <span className="text-red-500" aria-hidden="true">*</span></label>
                                <input id="q-name" className="form-input" type="text" placeholder="e.g. John Smith" required aria-required="true"
                                    autoComplete="name"
                                    onFocus={() => handleFocus('name')}
                                    value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="q-phone">Phone Number <span className="text-red-500" aria-hidden="true">*</span></label>
                                <input id="q-phone" className="form-input" type="tel" placeholder="Your best contact number" required aria-required="true"
                                    autoComplete="tel"
                                    onFocus={() => handleFocus('phone')}
                                    value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} />
                                {/* 🧠 Convert UX: Explaining why a phone number is needed reduces anxiety and fear of spam, increasing form completion rates. */}
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.375rem' }}>
                                    We'll only call to discuss your roof. No spam.
                                </p>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="q-suburb">Suburb</label>
                                <input id="q-suburb" className="form-input" type="text" placeholder="e.g. Doncaster"
                                    autoComplete="address-level2"
                                    onFocus={() => handleFocus('suburb')}
                                    value={formData.suburb} onChange={e => setFormData(d => ({ ...d, suburb: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="q-service">Service Needed</label>
                                <select id="q-service" className="form-select"
                                    onFocus={() => handleFocus('service')}
                                    value={formData.service} onChange={e => setFormData(d => ({ ...d, service: e.target.value }))}>
                                    <option value="">Select a service...</option>
                                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="q-message">More Details (Optional)</label>
                                <textarea id="q-message" className="form-textarea" placeholder={messagePlaceholder}
                                    onFocus={() => handleFocus('message')}
                                    value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))} />
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                    {messageHelperText}
                                </p>
                            </div>
                            {/* 🧠 Convert UX: Adding a directional arrow to the CTA implies forward momentum and increases click-through. */}
                            <motion.button type="submit" className="cta-primary" disabled={sending} aria-disabled={sending} aria-live="polite"
                                animate={urgency >= 4 && !shouldReduceMotion ? { scale: [1, 1.03, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    opacity: sending ? 0.7 : 1,
                                    padding: urgency >= 4 ? '1.25rem 2rem' : urgency === 3 ? '1rem 1.5rem' : '0.875rem 1.5rem',
                                    fontSize: urgency >= 4 ? '1.15rem' : '1rem',
                                    backgroundColor: urgency >= 4 ? '#ef4444' : undefined,
                                    boxShadow: urgency >= 4 ? '0 0 40px rgba(239, 68, 68, 0.4)' : undefined,
                                    border: urgency >= 4 ? '1px solid rgba(252, 165, 165, 0.5)' : undefined
                                }}>
                                {sending ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
                                            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                                        </svg>
                                        Hold on a sec...
                                    </span>
                                ) : (
                                    <>{ctaText} &rarr;</>
                                )}
                            </motion.button>
                            {/* 🧠 Convert UX: Trust signals and friction-reducing microcopy at the point of action. */}
                            <div style={{
                                marginTop: '0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: '#f59e0b',
                                    fontSize: '0.9rem'
                                }}>
                                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', marginLeft: '0.25rem', fontSize: '0.85rem' }}>
                                        Based on 150+ Google Reviews
                                    </span>
                                </div>
                                <div style={{
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem'
                                }}>
                                    <span>🔒</span> 100% Secure. No obligation. Takes 30 seconds.
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ⚡ Bolt: Memoize functional component to prevent unnecessary re-renders when parent props don't change
export default memo(QuoteForm);

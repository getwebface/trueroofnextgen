import { useState, memo, type FC, type FormEvent } from 'react';
import type { WeatherContext } from '../utils/weatherProcessor';

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
    2: '📋 Get My Free Quote',
    1: '📋 Get My Free Quote',
};

const QuoteForm: FC<QuoteFormProps> = ({ ctx }) => {
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

    const ctaText = urgencyCTAs[urgency] || urgencyCTAs[1];

    const handleFocus = () => {
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

    if (submitted) {
        return (
            <div className="quote-form-card" style={{ textAlign: 'center' }}>
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
            </div>
        );
    }

    return (
        <div className="quote-form-card">
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
                        onFocus={handleFocus}
                        value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-phone">Phone Number <span className="text-red-500" aria-hidden="true">*</span></label>
                    <input id="q-phone" className="form-input" type="tel" placeholder="04XX XXX XXX" required aria-required="true"
                        autoComplete="tel"
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
                        value={formData.suburb} onChange={e => setFormData(d => ({ ...d, suburb: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-service">Service Needed</label>
                    <select id="q-service" className="form-select"
                        onFocus={handleFocus}
                        value={formData.service} onChange={e => setFormData(d => ({ ...d, service: e.target.value }))}>
                        <option value="">Select a service...</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-message">More Details (Optional)</label>
                    <textarea id="q-message" className="form-textarea" placeholder="Describe the issue or what you've noticed..."
                        onFocus={handleFocus}
                        value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))} />
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                        Have a promo code? Let us know when we call.
                    </p>
                </div>
                {/* 🧠 Convert UX: Adding a directional arrow to the CTA implies forward momentum and increases click-through. */}
                <button type="submit" className="cta-primary" disabled={sending} aria-disabled={sending} aria-live="polite"
                    style={{
                        width: '100%',
                        marginTop: '0.5rem',
                        opacity: sending ? 0.7 : 1,
                        padding: urgency >= 4 ? '1.25rem 2rem' : urgency === 3 ? '1rem 1.5rem' : '0.875rem 1.5rem',
                        fontSize: urgency >= 4 ? '1.15rem' : '1rem',
                        backgroundColor: urgency >= 4 ? '#ef4444' : undefined,
                        boxShadow: urgency >= 4 ? '0 0 40px rgba(239, 68, 68, 0.4)' : undefined,
                        animation: urgency >= 4 ? 'pulseGlow 2s infinite' : undefined,
                        border: urgency >= 4 ? '1px solid rgba(252, 165, 165, 0.5)' : undefined
                    }}>
                    {sending ? 'Sending...' : <>{ctaText} &rarr;</>}
                </button>
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
        </div>
    );
};

// ⚡ Bolt: Memoize functional component to prevent unnecessary re-renders when parent props don't change
export default memo(QuoteForm);

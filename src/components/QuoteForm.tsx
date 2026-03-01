import { useState, type FC, type FormEvent } from 'react';
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

// Map urgency to CTA labels
const urgencyCTAs: Record<number, string> = {
    5: '🚨 Get Emergency Quote Now',
    4: '⚡ Request Urgent Inspection',
    3: '📋 Book Free Inspection',
    2: '📋 Request a Quote',
    1: '📋 Schedule My Quote',
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

    const ctaText = urgencyCTAs[urgency] || urgencyCTAs[1];

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
                <a href="tel:0400000000" className="cta-primary">
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
                    <label className="form-label" htmlFor="q-name">Your Name</label>
                    <input id="q-name" className="form-input" type="text" placeholder="e.g. John Smith" required
                        value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-phone">Phone Number</label>
                    <input id="q-phone" className="form-input" type="tel" placeholder="04XX XXX XXX" required
                        value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-suburb">Suburb</label>
                    <input id="q-suburb" className="form-input" type="text" placeholder="e.g. Doncaster"
                        value={formData.suburb} onChange={e => setFormData(d => ({ ...d, suburb: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-service">Service Needed</label>
                    <select id="q-service" className="form-select"
                        value={formData.service} onChange={e => setFormData(d => ({ ...d, service: e.target.value }))}>
                        <option value="">Select a service...</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-message">More Details (Optional)</label>
                    <textarea id="q-message" className="form-textarea" placeholder="Describe the issue or what you've noticed..."
                        value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))} />
                </div>
                <button type="submit" className="cta-primary" disabled={sending}
                    style={{ width: '100%', marginTop: '0.5rem', opacity: sending ? 0.7 : 1 }}>
                    {sending ? 'Sending...' : ctaText}
                </button>
            </form>
        </div>
    );
};

export default QuoteForm;

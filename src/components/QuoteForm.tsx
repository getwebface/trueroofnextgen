import { useState, type FC, type FormEvent } from 'react';

interface QuoteFormProps {
    weatherMode: string;
    city: string;
}

const ctaTextMap: Record<string, string> = {
    STORM_EMERGENCY: '🚨 Get Emergency Repair Quote',
    RAIN_ACTIVE: '🌧️ Request Same-Day Inspection',
    PREVENTATIVE: '🍂 Book Free Autumn Check-Up',
    ROOF_RESTORATION: '☀️ Get Your Free Quote',
    DEFAULT: '📋 Get Your Free Quote',
};

const services = [
    'Full Tile Restoration',
    'Roof Tile Cleaning',
    'Re-bedding & Flexi-Pointing',
    'Metal Flashing Repairs',
    'Valley Iron Replacement',
    'Emergency Leak Repair',
    'Roof Inspection',
    'Protective Coating',
];

const QuoteForm: FC<QuoteFormProps> = ({ weatherMode, city }) => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        suburb: city || '',
        service: weatherMode === 'STORM_EMERGENCY' ? 'Emergency Leak Repair' : '',
        message: '',
    });

    const ctaText = ctaTextMap[weatherMode] || ctaTextMap.DEFAULT;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Track conversion event
        if (typeof window !== 'undefined' && (window as any).trackEvent) {
            (window as any).trackEvent('quote_form_submit', {
                service: formData.service,
                suburb: formData.suburb,
                weatherMode,
            });
        }

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="quote-form-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: '0.75rem' }}>
                    Thanks! We'll Call You Shortly.
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    One of our team will be in touch within 2 hours during business hours.
                    For urgent matters, call us directly.
                </p>
                <a href="tel:0400000000" className="cta-primary" style={{ marginTop: '1.5rem' }}>
                    📞 Call Now Instead
                </a>
            </div>
        );
    }

    return (
        <div className="quote-form-card">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: '0.25rem' }}>
                Request a Free Quote
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.87rem', marginBottom: '1.75rem' }}>
                No obligation. We'll get back to you within 2 hours.
            </p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="quote-name">Your Name</label>
                    <input
                        id="quote-name"
                        className="form-input"
                        type="text"
                        placeholder="e.g. John Smith"
                        required
                        value={formData.name}
                        onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="quote-phone">Phone Number</label>
                    <input
                        id="quote-phone"
                        className="form-input"
                        type="tel"
                        placeholder="04XX XXX XXX"
                        required
                        value={formData.phone}
                        onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="quote-suburb">Suburb</label>
                    <input
                        id="quote-suburb"
                        className="form-input"
                        type="text"
                        placeholder="e.g. Doncaster"
                        value={formData.suburb}
                        onChange={e => setFormData(d => ({ ...d, suburb: e.target.value }))}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="quote-service">Service Needed</label>
                    <select
                        id="quote-service"
                        className="form-select"
                        value={formData.service}
                        onChange={e => setFormData(d => ({ ...d, service: e.target.value }))}
                    >
                        <option value="">Select a service...</option>
                        {services.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="quote-message">Tell Us More (Optional)</label>
                    <textarea
                        id="quote-message"
                        className="form-textarea"
                        placeholder="Describe the issue or what you need..."
                        value={formData.message}
                        onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                    />
                </div>
                <button type="submit" className="cta-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    {ctaText}
                </button>
            </form>
        </div>
    );
};

export default QuoteForm;

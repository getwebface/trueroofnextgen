import re

with open("src/components/QuoteForm.tsx", "r") as f:
    content = f.read()

# Replace CTA button with a dynamic style based on urgency
button_repl = """                <button type="submit" className="cta-primary" disabled={sending} aria-disabled={sending} aria-live="polite"
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
                    {sending ? 'Sending...' : ctaText}
                </button>"""

content = re.sub(
    r'<button type="submit" className="cta-primary"[^>]*>.*?<\/button>',
    button_repl,
    content,
    flags=re.DOTALL
)

with open("src/components/QuoteForm.tsx", "w") as f:
    f.write(content)

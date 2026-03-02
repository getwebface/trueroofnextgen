import re

with open("src/pages/index.astro", "r") as f:
    content = f.read()

# Update TrustBar instantiation to pass ctx
content = content.replace("<TrustBar />", "<TrustBar ctx={weatherContext} />")

# Add preventative maintenance block for urgency <= 2
# We'll place it right after the hero and before services, or perhaps inside the services section.
# A good place is before the services grid if urgency <= 2
preventative_block = """
      {weatherContext?.urgency && weatherContext.urgency <= 2 && (
        <div style="margin-bottom: 3rem; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: var(--radius-card); padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem;">
          <div style="font-size: 1.5rem; margin-top: 0.1rem;">💡</div>
          <div>
            <h4 style="font-family: Outfit, sans-serif; font-weight: 700; font-size: 1.1rem; color: #fbbf24; margin-bottom: 0.25rem;">Ideal Conditions for Preventative Maintenance</h4>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; line-height: 1.5; margin: 0;">
              {weatherContext?.copyHints?.seasonalTip || 'Current weather is perfect for roof inspections and restorative work. Book now before conditions change.'}
            </p>
          </div>
        </div>
      )}
"""

content = content.replace('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">', preventative_block + '\n      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">')

with open("src/pages/index.astro", "w") as f:
    f.write(content)

## 2024-05-24 - Missing Focus Indicators on Interactive Elements
**Learning:** Custom interactive elements (like `.cta-primary` and `.cta-secondary` links) lack visible focus states (`:focus-visible`), making keyboard navigation difficult for screen reader and keyboard-only users.
**Action:** Added global and component-specific `:focus-visible` outlines using brand colors and offsets to ensure WCAG compliant focus indicators.

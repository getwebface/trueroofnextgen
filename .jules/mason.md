## 2024-05-24 - Injecting React Arrays into Astro Markdown
**Learning:** When passing array props (like `images={[ { src: "...", alt: "..." } ]}`) to a React component inside a `.md` Astro file, the component must be wrapped with blank lines to avoid markdown parser confusion, and the array must be correctly formatted as a JSX expression.
**Action:** Always verify the trailing blank lines after the injected component and ensure `client:visible` is attached to prevent hydration blocking.

## 2024-03-06 - HTML Injection in Astro Markdown (.md)
**Learning:** When injecting raw HTML (like `<div class="glass-card"...>`) into Astro Markdown (`.md`) files to create trust blocks, it is absolutely critical to leave blank lines between the HTML tags and the inner Markdown text. Otherwise, Astro's Markdown parser will fail to process inner Markdown formatting (like bolding `**10-Year Workmanship Guarantee**`) and render it as plain text instead.
**Action:** Always wrap injected HTML blocks with blank lines before and after the text content when working in `.md` and `.mdx` files.

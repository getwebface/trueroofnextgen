## 2026-03-03 - Dynamic Metadata in Astro Layouts
**Learning:** When passing dynamic metadata (like title and description) to an Astro layout component from nested pages, you must explicitly declare a  interface and extract the values via , while also providing solid fallback values to ensure pages that haven't been updated still render correctly.
**Action:** Use  and  in layout components to safely handle optional metadata injections.
## 2024-03-03 - Dynamic Metadata in Astro Layouts
**Learning:** When passing dynamic metadata (like title and description) to an Astro layout component from nested pages, you must explicitly declare a `Props` interface and extract the values via `Astro.props`, while also providing solid fallback values to ensure pages that haven't been updated still render correctly.
**Action:** Use `export interface Props { title?: string; description?: string; }` and `const { title, description } = Astro.props;` in layout components to safely handle optional metadata injections.

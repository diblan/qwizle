# Angular conventions

When creating Angular components:

- Always use the classic four-file component structure:
  - `.component.ts`
  - `.component.html`
  - `.component.scss`
  - `.component.spec.ts`
- Do not use inline templates.
- Do not use inline styles.
- Prefer Angular CLI generators:
  - `ng generate component path/name --style=scss --skip-tests=false`
- Keep `.ts` files for component logic only.
- Put layout and semantic markup in `.html`.
- Put styling in `.scss`.
- After changes, run:
  - `npm run lint`
  - `npm test` if tests are affected
  - `npm run build`

## UI conventions

- Use Angular + Bootstrap.
- Do not use Spartan UI.
- Do not use Angular Material.
- Do not introduce another component library unless explicitly requested.
- Prefer Bootstrap classes and utilities for layout, spacing, buttons, forms, dropdowns, and responsive grids.
- Use Bootstrap naming and behavior conventions before adding custom project styles.
- Use custom SCSS only for project-specific branding or when Bootstrap utilities are not enough.
- Keep custom SCSS small and readable.
- Prefer accessible markup: labels, aria attributes, semantic structure, and keyboard-friendly controls.
- Keep the design minimal, modern, and clean.
- Prefer familiar product patterns over decorative layouts.

## Quizle visual identity

Use this colour scheme:

- Primary: `#C4B5FD`
- Dark background: `#0F172A`
- Surface: `#1E293B`
- Text: `#E5E7EB`
- Muted text: `#9CA3AF`
- Accent: `#A78BFA`

The Quizle UI should feel:

- dark
- centered
- minimal
- game-like but not childish
- inspired by Loldle-style daily game layouts

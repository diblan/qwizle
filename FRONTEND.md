# Angular conventions

When creating Angular components:

- Always use separate files:
  - `component-name.component.ts`
  - `component-name.component.html`
  - `component-name.component.scss`
  - `component-name.component.spec.ts`
- Do not use inline templates.
- Do not use inline styles.
- Prefer Angular CLI generators:
  - `ng generate component path/name --style=scss --skip-tests=false`
- Keep `.ts` files for component logic only.
- Put markup in `.html`.
- Put styling in `.scss`.
- After changes, run:
  - `npm run lint`
  - `npm test` if tests are affected
  - `npm run build`

## UI conventions

- Use Angular + Spartan UI + Tailwind CSS.
- Follow Spartan's Brain/Helm approach: use accessible primitives and style through Tailwind classes.
- Use Spartan UI components where appropriate.
- Do not replace Spartan UI with another component library.
- Do not introduce Angular Material, Bootstrap, or broad custom CSS unless necessary.
- Use consistent Tailwind utility classes.
- Prefer accessible markup: labels, aria attributes, semantic structure, and keyboard-friendly controls.
- Keep the design minimal, modern, and clean.
- Prefer familiar product patterns over decorative layouts. For example, a login page should usually be a focused username/password form with a submit button and helpful links such as register and password recovery.

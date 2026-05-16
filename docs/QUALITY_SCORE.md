# Quality Score

Use this rubric to evaluate changes before calling them done. It is a lightweight guide, not a replacement for judgment.

## Product Behavior

High quality product behavior is visible in the running app, supports the learning routine, and respects current non-goals. A change should make it clear what the learner can do now that they could not do before.

## Backend

Backend changes should follow Spring Boot conventions, keep API behavior explicit, validate inputs at boundaries, use Flyway for schema changes, and protect authenticated resources. New database changes should be reproducible from a clean database.

## Frontend

Frontend changes should follow `FRONTEND.md`: Angular components use separate `.ts`, `.html`, `.scss`, and `.spec.ts` files; Bootstrap is preferred for UI structure; custom SCSS stays small; accessibility is part of the implementation.

## Tests

Tests should cover new behavior or changed contracts. Prefer checks that would fail before the change and pass after. Run the narrow relevant checks locally before finishing.

## Documentation

Docs should change with behavior. If a command, endpoint, product rule, security expectation, or architectural boundary changes, update the relevant Markdown in the same patch.

## Local Run

The full app should remain runnable from the repository root with:

```sh
docker compose up --build
```

If this command changes, update `README.md` and `docs/RELIABILITY.md`.

## CI

CI should be green before merge. If CI infrastructure is missing or blocked, document the blocker and the closest local checks that were run.

## Known Gaps

- CI expectations are documented, but this scaffold does not verify that a complete CI pipeline exists.
- The first ExecPlan records dependency registry failures from an earlier environment; keep that caveat only while it remains relevant.
- Advanced learner progression, weighted question reappearance, and detailed dashboards are intentionally out of scope.
- Generated API or schema documentation does not exist yet.

# Qwizle — Agent Operating Guide

This repository is AI-first: **the codebase is written and maintained by AI agents** with human product direction.

Use this file as the short entry point. Durable product, design, quality, reliability, and security guidance lives in `docs/`.

## Read first

- `docs/index.md` — documentation map for humans and agents.
- `docs/product-specs/product-vision.md` — product goal, current slice, and non-goals.
- `ARCHITECTURE.md` — monorepo boundaries and current runtime architecture.
- `FRONTEND.md` — Angular and UI implementation rules.
- `docs/DESIGN.md` — visual and UX direction.
- `docs/PRODUCT_SENSE.md` — product decision guidance when requirements are underspecified.
- `docs/QUALITY_SCORE.md` — quality rubric and known gaps.
- `docs/RELIABILITY.md` — local run, checks, migrations, and workflow reliability.
- `docs/SECURITY.md` — current security posture and future security rules.
- `PLANS.md` — ExecPlan requirements for complex features or significant refactors.

## Primary stack

- **Backend:** Spring Boot
- **Database migrations:** Flyway
- **Database:** Postgres
- **Frontend:** Angular

## Definition of done (applies to all features)

A feature is done only when all are true:

1. Tests are added or updated.
2. Documentation is updated.
3. The app runs locally with one command.
4. CI is green.

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan as described in `PLANS.md`. Store plans under `docs/exec-plans/` and keep their living sections current.

## Working agreements for agents

- Keep architecture simple and evolvable.
- Prefer clear naming and maintainable code over cleverness.
- Update docs alongside behavior changes.
- If introducing new tools/scripts, document exact usage.
- If blocked by missing infrastructure, leave clear TODOs and constraints.

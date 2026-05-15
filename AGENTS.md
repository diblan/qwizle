# Qwizle — Agent Operating Guide

This repository is AI-first: **the codebase is written and maintained by AI agents** with human product direction.

## Product direction

### Goal
- **Qwizle is an app for learning and long-term retention.**
- It should feel like a daily brain-sharpening routine (inspired by Wordle-like cadence and Duolingo-like habit loops).

### Non-goals (for now)
- No detailed learner track record dashboards yet.
- No weighted question reappearance logic yet.

## Primary stack
- **Backend:** Spring Boot
- **Database migrations:** Flyway
- **Database:** Postgres
- **Frontend:** Angular

## Frontend guidance
- For frontend work, read and follow `FRONTEND.md`.

## Definition of done (applies to all features)
A feature is done only when all are true:
1. Tests are added or updated.
2. Documentation is updated.
3. The app runs locally with one command.
4. CI is green.

## Harness-first engineering expectations
To keep AI-generated code reliable, every change should be built around a testable harness:

1. **Executable checks first**
   - Prefer creating or updating tests/checks that fail before implementation and pass after.
2. **Small, verifiable increments**
   - Keep changes scoped and easy to validate.
3. **Deterministic workflows**
   - Use repeatable commands/scripts for build, test, lint, and run.
4. **Fast feedback loops**
   - Run relevant tests locally before finishing work.
5. **Evidence in PRs**
   - Summarize what changed, why, and which checks passed.

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.agent/PLANS.md`) from design to implementation.

## Working agreements for agents
- Keep architecture simple and evolvable.
- Prefer clear naming and maintainable code over cleverness.
- Update docs alongside behavior changes.
- If introducing new tools/scripts, document exact usage.
- If blocked by missing infrastructure, leave clear TODOs and constraints.

## Initial product framing
- Qwizle will start with daily learning challenges.
- Difficulty can evolve over time and previously failed content can reappear in future iterations.
- Implement advanced progression logic only after the current non-goals are promoted.

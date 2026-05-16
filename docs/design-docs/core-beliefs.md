# Core Beliefs

Qwizle is maintained in an agent-first workflow, so changes should be easy for a future agent or human to verify from the repository alone.

Prefer small, verifiable increments. A good change has a narrow purpose, clear files touched, and obvious checks.

Use executable checks before or alongside implementation. Tests, scripts, builds, and local run commands are the harness that keeps AI-generated code reliable.

Update docs with behavior. If the way to run, test, secure, or understand the app changes, the relevant Markdown should change in the same patch.

Choose boring, understandable architecture. Clear names, ordinary framework patterns, and simple module boundaries matter more than clever abstractions.

Keep boundaries evolvable. Frontend code belongs in `app/`, backend code belongs in `api/`, and shared knowledge belongs in docs rather than hidden assumptions.

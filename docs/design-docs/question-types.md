# Question Type Design

This document records the unified design for Qwizle question types. The first implementation follows this shape with text-only v1 content, JSON-backed type definitions, per-type backend handlers, and a shared Angular question renderer.

## Problem

Qwizle started with a useful first slice: authenticated learners could create and attempt prototype one-answer and fixed-size set-answer questions. That model was intentionally small, but it stored type-specific answer data in columns such as `answer_text`, `question_type`, and `solution_count`.

That approach will become brittle as soon as Qwizle adds multiple choice, matching, media, richer feedback, and future scoring modes. The risk is not any one feature. The risk is several independent models for "question", "answer", "attempt", "validation", and "feedback" growing in different directions.

## Final Recommendations

Use one canonical question concept with common fields plus type-specific definition data.

The recommended first durable shape is:

- A shared `questions` table for identity, ownership, prompt text, type, metadata, explanation, and timestamps.
- A shared `question_attempts` table for submitted answers, scores, correctness, feedback snapshots, and timestamps.
- Type-specific `definition_json` and `submission_json` fields validated by Java records and per-type handlers.
- A backend `QuestionTypeHandler` registry, where each question type owns definition validation, learner-safe rendering, submission validation, and scoring.
- A frontend shared question renderer that delegates only the input control to type-specific components.

For a pet-project first version, storing type-specific data as JSON text is the best balance. It avoids table churn for every new type, stays understandable in Spring Boot, works with H2-style local development, and still lets Java enforce strong validation. If Qwizle later needs deep reporting on options, match pairs, or answer-level analytics, the JSON fields can be selectively normalized without changing the API concept.

## Open Questions

- Should result feedback reveal the full correct answer immediately, or only say correct/incorrect for daily challenge attempts? The recommendation is to reveal enough for learning in normal practice, but keep the response contract capable of hiding solutions in future competitive modes.
- Should text answer matching support aliases and normalization only, or also fuzzy matching? The recommendation is exact normalized matching for v1. Fuzzy matching can be added later as an explicit scoring policy.
- Should partial credit exist in v1? The recommendation is all-or-nothing for v1, with the result shape already containing `score` and `maxScore` so partial credit can arrive later without changing every response.
- Should authors get a separate solution-visible API view? The recommendation is learner-safe retrieval by default, with an authoring endpoint or query option added only when the UI needs editing.

## Shared Concepts

Every question type should share the same top-level concepts:

- `id`: stable question identity.
- `createdByUserId`: owner or creator identity.
- `prompt`: the learner-facing prompt, starting with text and later allowing media attachments.
- `type`: one of `SINGLE_ANSWER`, `MULTIPLE_ANSWER`, `MULTIPLE_CHOICE`, or `MATCH`.
- `definition`: type-specific data needed to render, validate, and score the question.
- `submission`: learner-provided answer data for one attempt.
- `validation`: rules for whether a definition or submission is well-formed.
- `scoring`: rules for converting a valid submission into correctness and score.
- `feedback`: learner-facing result text, explanation, and optional solution reveal after an attempt.
- `difficulty`: optional coarse label such as `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`.
- `tags`: optional topic labels such as `web`, `networking`, or `java`.
- `category`: optional broader grouping. Defer until the product needs it.
- `media`: future prompt, option, or match item attachments. Design for it now, but do not implement uploads until needed.

The common rule is: retrieval returns a learner-safe question view, not the hidden correct-answer model. Attempt results may include feedback and revealed solutions depending on the scoring policy.

## Canonical Data Model

### Common Question Fields

Recommended conceptual model:

```json
{
  "id": 42,
  "type": "MULTIPLE_CHOICE",
  "prompt": {
    "text": "Which protocols commonly use TCP?",
    "media": []
  },
  "difficulty": "BEGINNER",
  "tags": ["networking"],
  "createdByUserId": 1,
  "createdAt": "2026-05-16T12:00:00Z",
  "updatedAt": "2026-05-16T12:00:00Z"
}
```

Recommended stored fields:

- `id`
- `created_by_user_id`
- `type`
- `prompt_text`
- `prompt_media_json`
- `definition_json`
- `explanation`
- `difficulty`
- `created_at`
- `updated_at`

Tags can be deferred. If added early, prefer a normalized `question_tags(question_id, tag)` table over a Postgres-only array so local development remains portable.

### Type-Specific Definition Fields

Each `definition_json` should include only the data needed by that type. It should be deserialized into a typed Java record before validation or scoring.

Single answer:

```json
{
  "acceptedAnswers": [
    { "text": "Hypertext Transfer Protocol" }
  ],
  "normalization": {
    "trim": true,
    "caseSensitive": false,
    "collapseWhitespace": true
  }
}
```

Multiple answer:

```json
{
  "mode": "REQUIRED_SET",
  "answers": [
    { "id": "osi-physical", "text": "Physical" },
    { "id": "osi-data-link", "text": "Data Link" }
  ],
  "normalization": {
    "trim": true,
    "caseSensitive": false,
    "collapseWhitespace": true
  }
}
```

For the "more than one answer can be accepted as correct" variant, use:

```json
{
  "mode": "ONE_OF_ACCEPTED",
  "answers": [
    { "id": "http-long", "text": "Hypertext Transfer Protocol" },
    { "id": "http-spaced", "text": "Hyper Text Transfer Protocol" }
  ]
}
```

Multiple choice:

```json
{
  "selectionMode": "MULTIPLE",
  "options": [
    { "id": "tcp", "content": { "kind": "TEXT", "text": "TCP" } },
    { "id": "udp", "content": { "kind": "TEXT", "text": "UDP" } },
    { "id": "http", "content": { "kind": "TEXT", "text": "HTTP" } }
  ],
  "correctOptionIds": ["tcp", "http"]
}
```

Match:

```json
{
  "leftItems": [
    { "id": "http", "content": { "kind": "TEXT", "text": "HTTP" } },
    { "id": "https", "content": { "kind": "TEXT", "text": "HTTPS" } }
  ],
  "rightItems": [
    { "id": "port-80", "content": { "kind": "TEXT", "text": "80" } },
    { "id": "port-443", "content": { "kind": "TEXT", "text": "443" } }
  ],
  "pairs": [
    { "leftId": "http", "rightId": "port-80" },
    { "leftId": "https", "rightId": "port-443" }
  ]
}
```

Use stable option and item IDs. Do not use array positions as submitted answer values because ordering can change later.

### Type-Specific Submission Fields

All submissions should share one wrapper:

```json
{
  "type": "MULTIPLE_CHOICE",
  "response": {}
}
```

Type-specific examples:

Single answer:

```json
{
  "type": "SINGLE_ANSWER",
  "response": {
    "text": "hypertext transfer protocol"
  }
}
```

Multiple answer, one accepted answer:

```json
{
  "type": "MULTIPLE_ANSWER",
  "response": {
    "answers": ["Hypertext Transfer Protocol"]
  }
}
```

Multiple answer, required set:

```json
{
  "type": "MULTIPLE_ANSWER",
  "response": {
    "answers": ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"]
  }
}
```

Multiple choice:

```json
{
  "type": "MULTIPLE_CHOICE",
  "response": {
    "selectedOptionIds": ["tcp", "http"]
  }
}
```

Match:

```json
{
  "type": "MATCH",
  "response": {
    "pairs": [
      { "leftId": "http", "rightId": "port-80" },
      { "leftId": "https", "rightId": "port-443" }
    ]
  }
}
```

## Alternative Data Designs

### Fully Normalized Tables

Example: `questions`, `question_options`, `question_answers`, `match_items`, `match_pairs`.

Benefits:

- Strong database constraints.
- Easier SQL reporting.
- Easier answer-level analytics later.

Costs:

- More migrations before the product shape is stable.
- More joins and service code for early features.
- More risk of designing the wrong schema too early.

### One Table Per Question Type

Example: `single_answer_questions`, `multiple_choice_questions`, `match_questions`.

Benefits:

- Each type has a clear schema.
- Type-specific constraints are easier than with a single JSON field.

Costs:

- Cross-type lists and quizzes need unions or extra mapping tables.
- Every new type adds more persistence plumbing.
- Shared behavior can drift.

### JSON Definition With Typed Java Validation

Benefits:

- One shared question lifecycle.
- New types add handler code and JSON shape, not a full schema redesign.
- Works well while Qwizle is still learning its product shape.

Costs:

- Fewer database-level constraints.
- Reporting inside options, pairs, or answers is harder.
- Validation discipline must live in backend tests and handler code.

Recommendation: use JSON definitions for v1, with typed Java records and strong tests. Normalize only when a specific query or constraint becomes valuable enough to justify it.

## API-Level Design

Use a single questions API rather than one endpoint family per type.

Recommended endpoints:

- `POST /api/questions`: create a question.
- `GET /api/questions`: list learner-safe questions.
- `GET /api/questions/{questionId}`: retrieve one learner-safe question.
- `POST /api/questions/{questionId}/attempts`: submit an answer.
- Optional later: `GET /api/questions/{questionId}/authoring`: retrieve solution-visible authoring data for the owner.

### Create Single Answer

Request:

```json
{
  "type": "SINGLE_ANSWER",
  "prompt": { "text": "What does HTTP stand for?" },
  "definition": {
    "acceptedAnswers": [
      { "text": "Hypertext Transfer Protocol" }
    ]
  },
  "explanation": "HTTP is the application-layer protocol used by the web.",
  "difficulty": "BEGINNER",
  "tags": ["web"]
}
```

Learner-safe response:

```json
{
  "id": 42,
  "type": "SINGLE_ANSWER",
  "prompt": { "text": "What does HTTP stand for?", "media": [] },
  "interaction": {
    "kind": "TEXT",
    "minAnswers": 1,
    "maxAnswers": 1
  },
  "difficulty": "BEGINNER",
  "tags": ["web"]
}
```

### Create Multiple Answer

Request for required set:

```json
{
  "type": "MULTIPLE_ANSWER",
  "prompt": { "text": "Name all layers of the OSI model." },
  "definition": {
    "mode": "REQUIRED_SET",
    "answers": [
      { "id": "physical", "text": "Physical" },
      { "id": "data-link", "text": "Data Link" },
      { "id": "network", "text": "Network" },
      { "id": "transport", "text": "Transport" },
      { "id": "session", "text": "Session" },
      { "id": "presentation", "text": "Presentation" },
      { "id": "application", "text": "Application" }
    ]
  }
}
```

Learner-safe response:

```json
{
  "id": 43,
  "type": "MULTIPLE_ANSWER",
  "prompt": { "text": "Name all layers of the OSI model.", "media": [] },
  "interaction": {
    "kind": "TEXT_LIST",
    "minAnswers": 7,
    "maxAnswers": 7
  }
}
```

### Create Multiple Choice

Request:

```json
{
  "type": "MULTIPLE_CHOICE",
  "prompt": { "text": "Which are transport-layer protocols?" },
  "definition": {
    "selectionMode": "MULTIPLE",
    "options": [
      { "id": "tcp", "content": { "kind": "TEXT", "text": "TCP" } },
      { "id": "udp", "content": { "kind": "TEXT", "text": "UDP" } },
      { "id": "http", "content": { "kind": "TEXT", "text": "HTTP" } }
    ],
    "correctOptionIds": ["tcp", "udp"]
  }
}
```

Learner-safe response:

```json
{
  "id": 44,
  "type": "MULTIPLE_CHOICE",
  "prompt": { "text": "Which are transport-layer protocols?", "media": [] },
  "interaction": {
    "kind": "OPTION_SELECTION",
    "selectionMode": "MULTIPLE",
    "options": [
      { "id": "tcp", "content": { "kind": "TEXT", "text": "TCP" } },
      { "id": "udp", "content": { "kind": "TEXT", "text": "UDP" } },
      { "id": "http", "content": { "kind": "TEXT", "text": "HTTP" } }
    ]
  }
}
```

### Create Match

Request:

```json
{
  "type": "MATCH",
  "prompt": { "text": "Match protocols to default ports." },
  "definition": {
    "leftItems": [
      { "id": "http", "content": { "kind": "TEXT", "text": "HTTP" } },
      { "id": "https", "content": { "kind": "TEXT", "text": "HTTPS" } }
    ],
    "rightItems": [
      { "id": "port-80", "content": { "kind": "TEXT", "text": "80" } },
      { "id": "port-443", "content": { "kind": "TEXT", "text": "443" } }
    ],
    "pairs": [
      { "leftId": "http", "rightId": "port-80" },
      { "leftId": "https", "rightId": "port-443" }
    ]
  }
}
```

Learner-safe response:

```json
{
  "id": 45,
  "type": "MATCH",
  "prompt": { "text": "Match protocols to default ports.", "media": [] },
  "interaction": {
    "kind": "MATCHING",
    "leftItems": [
      { "id": "http", "content": { "kind": "TEXT", "text": "HTTP" } },
      { "id": "https", "content": { "kind": "TEXT", "text": "HTTPS" } }
    ],
    "rightItems": [
      { "id": "port-80", "content": { "kind": "TEXT", "text": "80" } },
      { "id": "port-443", "content": { "kind": "TEXT", "text": "443" } }
    ]
  }
}
```

### Submit Answer

Single-answer request:

```json
{
  "type": "SINGLE_ANSWER",
  "response": {
    "text": "Hypertext Transfer Protocol"
  }
}
```

Multiple-answer required-set request:

```json
{
  "type": "MULTIPLE_ANSWER",
  "response": {
    "answers": ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"]
  }
}
```

Multiple-choice request:

```json
{
  "type": "MULTIPLE_CHOICE",
  "response": {
    "selectedOptionIds": ["tcp", "udp"]
  }
}
```

Match request:

```json
{
  "type": "MATCH",
  "response": {
    "pairs": [
      { "leftId": "http", "rightId": "port-80" },
      { "leftId": "https", "rightId": "port-443" }
    ]
  }
}
```

Result response shape, shared by all types:

```json
{
  "attemptId": 1001,
  "questionId": 44,
  "correct": true,
  "score": 1,
  "maxScore": 1,
  "feedback": {
    "message": "Correct.",
    "explanation": "TCP and UDP are transport-layer protocols.",
    "revealedSolution": {
      "type": "MULTIPLE_CHOICE",
      "correctOptionIds": ["tcp", "udp"]
    }
  },
  "attemptedAt": "2026-05-16T12:10:00Z"
}
```

The `type` in a submission should match the stored question type. If it does not, return `400 Bad Request`.

## Backend Design Direction

### Models and DTOs

Use clear layers:

- Persistence row: stores common columns plus JSON strings.
- Definition DTOs: typed Java records per question type.
- Learner response DTOs: learner-safe shape with prompt and interaction.
- Submission DTOs: typed Java records per question type.
- Result DTOs: shared result envelope with score, correctness, feedback, and optional revealed solution.

For Java, prefer records for immutable request and response DTOs. If using Jackson polymorphism, keep the discriminator explicit with `type`. If Spring/Jackson polymorphism feels too magical for this repo, deserialize `definition_json` with a small registry that maps `QuestionType` to the expected record class.

### Validation Strategy

Use two levels of validation:

- Boundary validation: required fields, string lengths, non-empty arrays, and auth checks.
- Type handler validation: option IDs are unique, correct IDs exist, required answer counts are valid, match pairs reference real items, and text answers normalize uniquely.

Examples:

- Single answer requires at least one accepted answer.
- Multiple answer `ONE_OF_ACCEPTED` requires at least two accepted answers and accepts exactly one submitted text answer.
- Multiple answer `REQUIRED_SET` requires at least two answers and accepts exactly that many submitted text answers in v1.
- Multiple choice requires at least two options, unique option IDs, and at least one correct option.
- Multiple choice `SINGLE` requires exactly one correct option and one submitted option.
- Match requires at least two left items, at least two right items, unique IDs per side, and one valid right item per left item in v1.

### Scoring Strategy

Start with all-or-nothing scoring:

- Correct result: `score = 1`, `maxScore = 1`, `correct = true`.
- Incorrect result: `score = 0`, `maxScore = 1`, `correct = false`.

Keep the result contract numeric so partial credit can be added later:

- Multiple answer partial credit could count matching normalized answers.
- Multiple choice partial credit could penalize wrong selected options.
- Match partial credit could count correct pairs.

Do not implement partial credit until the product asks for it.

### Avoiding Large If/Else Blocks

Introduce a small interface:

```java
interface QuestionTypeHandler<D, S> {
    QuestionType type();
    Class<D> definitionClass();
    Class<S> submissionClass();
    void validateDefinition(D definition);
    LearnerInteraction toLearnerInteraction(D definition);
    void validateSubmission(D definition, S submission);
    ScoringResult score(D definition, S submission);
}
```

Register one Spring bean per type and build a `Map<QuestionType, QuestionTypeHandler<?, ?>>`. Controllers and services should dispatch to the handler once, then keep shared persistence and response assembly generic.

This keeps type-specific behavior local:

- `SingleAnswerQuestionHandler`
- `MultipleAnswerQuestionHandler`
- `MultipleChoiceQuestionHandler`
- `MatchQuestionHandler`

## Frontend Design Direction

The frontend should have one shared question rendering flow:

- `QuestionRendererComponent`: owns prompt display, submit button, loading state, error state, and feedback/result display.
- Type-specific input components:
  - `SingleAnswerInputComponent`
  - `MultipleAnswerInputComponent`
  - `MultipleChoiceInputComponent`
  - `MatchInputComponent`
- Shared `QuestionService`: lists questions and submits attempts using the canonical API shapes.
- Shared validation message area: each input component reports whether the current submission is complete and any local error message.
- Shared result display: correctness, score, explanation, and revealed solution use one visual pattern across types.

Keep UI behavior consistent:

- Inputs should be keyboard-accessible.
- Empty submissions should show local validation before calling the API.
- Server validation errors should render in the same error location as local validation errors.
- Correct/incorrect feedback should use the same placement and tone for every type.
- Multiple choice should use radio buttons for `SINGLE` and checkboxes for `MULTIPLE`.
- Match should start with simple select controls or paired dropdowns before adding drag-and-drop. Drag-and-drop can be a progressive enhancement, not the foundation.

Future media support should use a shared `ContentBlock` model:

```ts
type ContentBlock =
  | { kind: 'TEXT'; text: string }
  | { kind: 'IMAGE'; url: string; altText: string };
```

In v1, only `TEXT` needs to be implemented.

## Database and Flyway Implications

Do not add type-specific columns for every type. Keep the canonical tables as the shared lifecycle for all question types.

Recommended target schema:

```sql
CREATE TABLE questions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    prompt_text TEXT NOT NULL,
    prompt_media_json TEXT NOT NULL DEFAULT '[]',
    definition_json TEXT NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_attempts (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    attempted_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_json TEXT NOT NULL,
    result_json TEXT NOT NULL,
    score NUMERIC(8, 3) NOT NULL,
    max_score NUMERIC(8, 3) NOT NULL,
    correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Optional tags table:

```sql
CREATE TABLE question_tags (
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag VARCHAR(80) NOT NULL,
    PRIMARY KEY (question_id, tag)
);
```

Migration strategy:

1. Use `questions`, `question_tags`, `question_attempts`, `quizzes`, and `quiz_questions` as the clean v1 schema.
2. Store type-specific definitions, submissions, and attempt result snapshots as JSON text.
3. Point `quiz_questions.question_id` at `questions(id)`.
4. Reset local prototype databases when moving from the old prototype schema to this implementation.

For the first implementation, JSON stored as `TEXT` is intentional. If Qwizle commits fully to Postgres-only runtime later, `JSONB` plus check constraints and JSON indexes can be introduced in a separate migration.

## Testing Strategy

### Unit Tests

Add fast unit tests around each handler:

- Definition validation accepts a minimal valid definition.
- Definition validation rejects missing prompt, empty answers, duplicate option IDs, invalid correct IDs, and invalid match pairs.
- Submission validation rejects wrong type, empty responses, unknown option IDs, duplicate selections, and incomplete match pairs.
- Scoring returns expected correctness and score.

### Integration Tests

Use MockMvc tests for the canonical API:

- Authenticated user can create, retrieve, and attempt each type.
- Question retrieval does not expose hidden correct answers.
- Attempt result includes correctness, score, attempted timestamp, and feedback.
- Missing or invalid bearer token still returns unauthorized.
- Attempting a missing question returns not found.
- Invalid definitions and invalid submissions return clear bad-request messages.

### Frontend Tests

Add focused Angular component tests:

- Renderer chooses the correct input component from `type`.
- Empty submissions show validation without calling the service.
- Multiple choice `SINGLE` uses one selected option.
- Multiple choice `MULTIPLE` supports multiple selections.
- Match component emits stable IDs, not display text.
- Result display renders correct, incorrect, score, and explanation consistently.

### Example Cases Per Type

Single answer:

- `"Paris"` matches `"paris"` after normalization.
- Blank answer is rejected.
- Alias answer is accepted when listed in `acceptedAnswers`.

Multiple answer:

- `ONE_OF_ACCEPTED` accepts one of several aliases.
- `REQUIRED_SET` accepts the correct set in any order.
- Missing, extra, duplicate, or blank answers are rejected or scored incorrect according to validation rules.

Multiple choice:

- Single-correct question rejects multiple selected options.
- Multiple-correct question requires exactly the correct option ID set for all-or-nothing v1.
- Unknown option IDs are rejected.

Match:

- Correct pairs in any submitted order score correct.
- Unknown left or right IDs are rejected.
- Missing pair for a left item is rejected.
- Duplicate left IDs in the submitted pairs are rejected.

## Implementation Notes

The first implementation supports all four v1 question types in one unified model:

- `SINGLE_ANSWER`: one free-text submission, one or more accepted answers.
- `MULTIPLE_ANSWER`: multiple free-text submissions, with `REQUIRED_SET` and `ONE_OF_ACCEPTED` modes.
- `MULTIPLE_CHOICE`: predefined text options with single or multiple correct option IDs.
- `MATCH`: text-only left and right items with stable IDs and required pairs.

Intentional v1 simplifications:

- Scoring is all-or-nothing for every type.
- Match input uses select controls rather than drag-and-drop.
- Content blocks are modeled for future media, but v1 validates option and match item content as text.
- The API returns learner-safe interactions instead of hidden definitions.
- The early prototype schema was replaced rather than preserved through a compatibility layer.

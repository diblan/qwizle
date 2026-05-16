# Security

This document records Qwizle's current security posture and practical rules for future changes. Keep it updated whenever authentication, authorization, secrets, or answer visibility changes.

## Current Auth Posture

The backend issues an opaque bearer token after successful login. Opaque means the token string does not contain user data that the frontend can decode; the backend looks it up to identify the session.

The Angular frontend stores the token in browser `localStorage` and sends it to API requests with an `Authorization: Bearer <token>` header through an HTTP interceptor.

The backend validates bearer tokens before serving authenticated question and quiz endpoints. Public endpoints should remain deliberately public; authenticated endpoints should reject missing or invalid tokens.

## Current Data Visibility Rules

Question and quiz listing endpoints should not expose answers. Answers may be accepted when creating questions or submitting attempts, but list responses should hide the correct answer data from learners.

## Rules For Future Agents

- Do not commit secrets, real credentials, API keys, private tokens, or production database URLs.
- Keep demo credentials clearly marked as demo-only.
- Validate inputs at API boundaries, especially login, question creation, quiz creation, and attempt submission.
- Keep auth-required endpoints protected when adding new backend routes.
- Avoid exposing correct answers in list or browse endpoints.
- Use Flyway migrations for security-relevant schema changes so they are reproducible.
- Update this document when auth, token storage, answer visibility, or data handling changes.

## Known Tradeoffs

Storing bearer tokens in `localStorage` is simple for the current learning shell, but it carries browser security tradeoffs. If Qwizle grows toward production use, revisit token storage, session expiration, CSRF strategy, HTTPS assumptions, and logout/revocation behavior.

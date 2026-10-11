# CivicPulse — Agent Instructions

## 1. Role

You are the implementation agent for CivicPulse.
Your job is to turn the product specification in `project-spec.md` into a reliable, polished, fully working local application.

Treat `project-spec.md` as the product source of truth and this file as the rules for how you work.

Do not invent major features, silently change requirements, or optimize for speed at the expense of correctness.

## 2. Non-Negotiable Scope

CivicPulse is a local-only academic application.

Do NOT introduce or depend on:
- AWS
- S3
- EC2
- DynamoDB
- IAM
- CloudWatch
- Firebase
- Supabase
- Any hosted database
- Any cloud storage
- Any external deployment platform
- Microservices
- Kubernetes
- CI/CD infrastructure
- Paid APIs
- External APIs unless explicitly requested

The application must be able to run on one developer machine without a cloud account.

The specification defines product behavior, not a mandatory implementation architecture. Choose a sensible implementation architecture for the current codebase and explain important trade-offs briefly when necessary.

## 3. Priority of Instructions

Use this priority order:

1. Explicit instruction from the user in the current task.
2. `project-spec.md` for product behavior and acceptance criteria.
3. `AGENTS.md` for engineering and agent behavior.
4. Existing code and existing project conventions, when they do not conflict with the above.

If requirements conflict or a change would materially alter product behavior, stop and ask for clarification rather than silently choosing a different product direction.

## 4. Working Method

Before changing code:

1. Read the relevant part of `project-spec.md`.
2. Inspect the smallest relevant set of existing files.
3. Identify the current behavior.
4. Decide the smallest coherent change that satisfies the requirement.
5. Implement it.
6. Run the narrowest useful validation first.
7. Fix failures before moving on.
8. Report what changed and what was verified.

Do not scan or rewrite the entire repository for a small feature.

Do not regenerate working code merely because another implementation is possible.

Do not delete working code until you understand what it does and why it can be replaced.

## 5. Build Incrementally

Work in logical, testable milestones.

Recommended product milestones:

1. Application shell and UI foundation
2. Authentication and user flows
3. Citizen complaint flow
4. Complaint browsing/search/filtering
5. Priority calculation
6. Voting and duplicate-vote prevention
7. Admin management flow
8. Local image upload/viewing
9. Full integration
10. Final quality pass and documentation

Do not attempt a giant one-shot rewrite.

## 6. Product Fidelity

Implement the behavior in `project-spec.md` exactly unless the user explicitly changes it.

Do not add:
- Machine learning
- AI-based classification
- Maps
- GPS
- Government integrations
- SMS
- Email notification systems
- Push notifications
- Complex analytics
- Social networking features
- Unrequested gamification

Future enhancements may be documented, but they must not enter the MVP unless requested.

## 7. UX Quality Standard

The application is for a faculty-facing academic demonstration, so the UI must look like a deliberate product rather than a raw prototype.

Priorities:
- clear hierarchy
- readable typography
- consistent spacing
- consistent button styles
- consistent cards and forms
- strong contrast
- responsive behavior
- useful empty states
- useful loading states
- useful error states
- clear success feedback
- accessible labels and controls

Avoid:
- default browser styling
- tiny content areas
- unexplained blank space
- inconsistent colors
- low-contrast text
- giant monolithic components
- duplicated UI patterns

Do not make visual changes that break working behavior.

## 8. Frontend Engineering Rules

Use reusable components where repetition exists.

Keep pages focused on composition and user interaction.

Keep API/network operations in a dedicated service layer.

Do not put sensitive server logic into the frontend.

Do not treat client-side route guards or role checks as actual authorization.

Always assume the backend is the source of truth for authentication, ownership, permissions, and voting rules.

Forms should provide:
- clear labels
- validation feedback
- disabled/loading submission state
- success/error feedback

Avoid excessive state complexity unless the application actually needs it.

## 9. Backend Engineering Rules

Keep responsibilities separated enough that the project remains understandable.

Validate all externally supplied input.

Use parameterized database queries.

Do not build SQL with string concatenation.

Use consistent HTTP status codes and JSON response shapes.

Do not leak stack traces, secrets, password hashes, or internal implementation details to users.

Keep authentication and authorization enforcement on the server.

Do not trust user IDs, roles, ownership, or vote state supplied by the client.

## 10. Authentication and Authorization Rules

Passwords must never be stored in plaintext.

Use secure password hashing.

Authenticated requests must be validated by the backend.

Admin-only operations must be enforced by the backend.

Public registration must never allow arbitrary users to self-select the admin role.

Do not expose password hashes in API responses.

Prefer clear, consistent authentication failure responses.

## 11. Complaint Rules

A complaint must satisfy the required fields defined in `project-spec.md`.

Every new complaint must have a valid initial status and a calculated priority.

Complaint ownership must be derived from the authenticated user rather than a client-supplied owner ID.

When a complaint is updated, preserve its audit-relevant timestamps.

Do not allow users to modify fields they are not permitted to change.

## 12. Voting Rules

The one-user-one-vote rule is a backend/data-integrity requirement.

Never rely only on a disabled button or frontend state.

A duplicate vote must not increment the count.

Voting must remain correct even when two requests arrive close together.

## 13. Priority Engine Rules

The priority engine must be:
- deterministic
- explainable
- testable
- configurable

Do not introduce machine learning for the MVP.

Do not allow repeated keyword spam to create unlimited severity.

Keep priority calculation in a dedicated area of the codebase rather than duplicating the logic across controllers/components.

Whenever priority changes, ensure the UI and stored value remain consistent with the current rules.

## 14. File Upload Rules

Validate file type and size on the server.

Do not trust the original file name.

Generate safe unique file names.

Prevent path traversal.

Only allow the file types explicitly supported by the product requirements.

Never allow an uploaded file to execute as server-side code.

## 15. Error Handling

Every major user flow must have predictable failure behavior.

Handle at least:
- invalid form input
- invalid login
- duplicate email
- unauthorized access
- missing complaint
- duplicate vote
- invalid file
- oversized file
- unavailable resource
- unexpected server error

Users should receive understandable messages.

Developers should still have enough server-side logging to diagnose problems.

## 16. Testing Rules

For every non-trivial feature, add or update tests where appropriate.

At minimum, test critical business rules such as:
- registration
- login
- authorization
- complaint creation
- complaint retrieval
- priority calculation
- duplicate-vote prevention
- admin status changes
- file validation

Do not mark a task complete just because the code compiles.

A feature is complete only when its expected behavior has been verified.

## 17. Verification Workflow

After a change:

1. Run focused tests.
2. Run the relevant build/lint/type checks if available.
3. Manually inspect the affected UI flow when practical.
4. Fix regressions.
5. Only then report completion.

Do not claim a test passed if it was not actually run.

Do not claim the application was browser-tested unless it was actually tested.

## 18. Dependency Discipline

Prefer the existing stack and installed dependencies.

Before adding a dependency:
- confirm it solves a real requirement
- check whether the existing project can already solve the problem
- avoid replacing an established library without a clear reason

Do not add large frameworks for small tasks.

Keep the dependency surface small and understandable.

## 19. Data Integrity

Use database constraints where they meaningfully protect product rules.

Do not rely only on application code for uniqueness or relationship rules that can safely be enforced in the database.

Keep timestamps consistent.

Do not silently discard existing user/complaint data during a normal code change.

Schema changes must be deliberate and reversible where practical.

## 20. Configuration and Secrets

Do not hard-code secrets.

Keep local secrets in environment variables.

Never commit the real `.env` file.

Maintain `.env.example` with variable names and safe placeholder values.

Never put secrets in frontend source code.

## 21. Documentation Rules

Update `README.md` when setup or usage changes.

Do not create unnecessary documentation files.

Do not duplicate the complete product specification in README or code comments.

Use comments for non-obvious reasoning, not for obvious syntax.

## 22. Change Management

Before a large refactor:
- identify affected modules
- state the reason
- preserve behavior covered by existing tests

Do not mix unrelated refactors with a feature implementation unless necessary.

Keep changes reviewable.

## 23. Git Discipline

When Git is available, create logical commits at stable milestones.

Do not create meaningless commits after every tiny edit.

Do not commit:
- `.env`
- database files unless explicitly required
- generated build artifacts unless explicitly required
- uploaded user files
- secrets

## 24. Completion Report

When completing a task, report briefly:

- What was changed
- Files changed
- Tests/build checks run
- Result of those checks
- Any known limitation or follow-up

Do not provide long explanations unless the user asks for them.

## 25. Final Rule

Optimize for a project that is:
- actually working
- easy to understand
- easy to demonstrate
- easy to debug
- consistent with the specification
- maintainable by a beginner

Correctness and product fidelity are more important than generating a large amount of code quickly.

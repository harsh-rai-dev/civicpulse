# CivicPulse — Product Specification

## 1. Product Summary

CivicPulse is a Smart City civic complaint reporting and priority-routing application.

The product gives citizens one place to report urban civic problems and gives administrators one place to review, prioritize, and track those problems through resolution.

Core product flow:

REPORT → STORE → PRIORITIZE → RESOLVE

The application is intended as an academic Smart City project and must provide a convincing, complete, locally runnable full-stack experience.

This specification describes product behavior and acceptance criteria. It intentionally does not prescribe the application's implementation architecture; the development agent should choose an appropriate architecture that satisfies this specification.

## 2. Product Objectives

CivicPulse must:

1. Make civic issue reporting simple for citizens.
2. Centralize submitted complaints.
3. Make issue urgency understandable through a transparent priority mechanism.
4. Encourage citizens to support existing reports rather than repeatedly submitting the same issue.
5. Give administrators an actionable view of complaints.
6. Allow administrators to track a complaint from submission to resolution.
7. Present the system as a polished, coherent product rather than a collection of disconnected pages.

## 3. MVP Boundaries

The MVP includes:

- Citizen authentication
- Admin authentication
- Complaint creation
- Optional complaint image
- Complaint browsing
- Complaint search
- Complaint filtering
- Complaint sorting
- Complaint details
- Community upvotes
- Priority scoring
- Admin complaint management
- Complaint status tracking
- Local persistence
- Responsive user interface

The MVP does not include external integrations or advanced AI features.

## 4. Users and Permissions

### Citizen

A citizen can:

- register
- log in
- log out
- view their dashboard
- browse complaints visible to citizens
- search complaints
- filter complaints
- sort complaints
- view complaint details
- create a complaint
- attach an optional image
- upvote a complaint once
- see the current status of complaints

A citizen cannot:

- create an admin account through public registration
- change another user's complaint ownership
- change complaint status
- bypass authentication
- submit votes on behalf of another user

### Admin

An admin can:

- log in
- view the administrative complaint list
- search complaints
- filter complaints
- sort complaints
- inspect complaint details
- see priority information
- see vote counts
- see complaint images
- update complaint status
- view basic complaint statistics

An admin account must be provisioned through a controlled setup mechanism rather than a public role selector.

## 5. Authentication Requirements

### Registration

Registration must collect:

- full name
- email
- password
- password confirmation

Validation:

- all required fields must be present
- email must be valid
- email must be unique
- password must satisfy the application's documented minimum rules
- password confirmation must match

Successful registration creates a citizen account.

### Login

Login must collect:

- email
- password

Successful login must establish an authenticated session/token and route the user to the correct experience for their role.

Failed login must show a useful error without exposing sensitive information.

### Logout

Logout must invalidate/remove the client session state appropriately so protected pages cannot continue to behave as though the user is authenticated.

## 6. Citizen Dashboard Requirements

The citizen dashboard should immediately communicate:

- how many complaints the user has submitted
- how many complaints are pending
- how many are in progress
- how many are resolved
- useful priority information

The main complaint list must support:

- search
- zone filter
- category filter
- status filter
- priority filter
- priority sorting
- newest/oldest sorting

Each complaint summary should make the following easy to see:

- issue/category
- zone
- landmark or location description
- priority level
- priority score where appropriate
- upvote count
- status
- creation time/date

## 7. Complaint Creation Requirements

A citizen must be able to submit a civic issue using:

Required:
- zone
- landmark/address
- category
- description

Optional:
- image

Suggested categories:

- Road
- Garbage
- Water
- Electricity
- Streetlight
- Safety
- Other

The UI should make the form easy to complete and should clearly explain validation errors.

On successful submission:

1. Validate the input.
2. Save the complaint.
3. Store the optional image if provided.
4. Calculate the initial priority.
5. Show success feedback.
6. Make the complaint visible in the appropriate list/detail views.

## 8. Complaint Details Requirements

A complaint details view must show, as appropriate:

- complaint identifier
- category
- zone
- landmark/address
- description
- image if available
- priority level
- priority score
- upvote count
- status
- created date/time
- updated date/time

The view must make it obvious whether the current user has already upvoted the complaint.

## 9. Upvote Requirements

The purpose of upvoting is to let citizens support an existing civic report rather than creating another report for the same issue.

Rules:

- one citizen can vote once per complaint
- duplicate voting must be rejected reliably
- a rejected duplicate vote must not alter the vote count
- successful voting must update the visible vote count
- priority must be refreshed when votes affect the priority calculation

The user interface should provide a clear explanation of why an existing complaint can be upvoted.

Optional future enhancement, not required for MVP:

- show similar complaints before submission

## 10. Priority System

Priority is a central CivicPulse feature.

Priority must be calculated from:

1. severity-related content in the complaint
2. community support represented by upvotes

The system must expose an understandable result:

- Critical
- High
- Medium
- Low

The calculation must be deterministic and explainable.

### Example severity vocabulary

Critical examples:
- fire
- gas leak
- collapse
- electrical danger

High examples:
- accident
- dangerous
- severe leakage

Medium examples:
- pothole
- road damage
- water leakage

Lower examples:
- garbage
- streetlight
- faded sign

The implementation may adjust weights, thresholds, and additional terms as long as the algorithm remains documented, sensible, and deterministic.

### Anti-gaming rule

Repeated copies of the same keyword must not produce unlimited score increases.

Example:

"fire fire fire fire fire"

must not be interpreted as five separate critical events.

The keyword contribution must be capped and repeated identical terms should not inflate the score without bound.

### Score transparency

Where practical, the system should make the factors understandable to administrators so they can explain why a complaint received its priority.

## 11. Complaint Status Requirements

Allowed statuses:

- Pending
- In Progress
- Resolved

Normal workflow:

Pending → In Progress → Resolved

Only admins can update status.

When status changes, the updated time must change.

Citizen views must reflect the current status without requiring the user to understand internal implementation details.

## 12. Admin Dashboard Requirements

The admin dashboard must provide a clear operational view.

It should display summary information such as:

- total complaints
- critical complaints
- high-priority complaints
- pending complaints
- in-progress complaints
- resolved complaints

The complaint-management list should expose:

- priority
- category
- zone
- upvotes
- status
- created date
- access to complaint details

Required controls:

- search
- filtering
- sorting
- status update

Priority ordering should be prominent because prioritization is a core purpose of CivicPulse.

## 13. Search, Filter, and Sort Behavior

Search should help locate complaints using appropriate user-facing fields such as:

- description
- landmark/address
- category

Filters:

- zone
- category
- status
- priority

Sort options:

- highest priority first
- lowest priority first
- newest first
- oldest first

Filtering and sorting should work together rather than behaving as mutually exclusive features.

Empty-state behavior must be clear when no complaints match the current criteria.

## 14. Image Requirements

The complaint form supports an optional image.

The product must:

- accept only supported image types
- enforce a sensible maximum file size
- provide clear validation feedback
- show a preview where practical before submission
- show the stored image on complaint details where available

The original user file name must not be trusted as a storage name.

A missing image must never prevent normal complaint functionality.

## 15. UI and Visual Design Requirements

The product should have a consistent civic-tech visual identity.

Desired qualities:

- professional
- modern
- trustworthy
- readable
- responsive
- clean
- clearly structured

Suggested visual direction:

- deep navy primary color
- teal/green accent
- light neutral page background
- white cards/surfaces
- dark readable text

These are design guidance, not strict brand colors.

### Landing page

Must clearly communicate:

- what CivicPulse is
- what problem it solves
- how it works
- why community participation matters
- how a user can get started

Suggested hero message:

"Report Issues. Improve Your City."

### Authentication pages

Must have:

- focused form layout
- clear headings
- field labels
- validation feedback
- useful error states
- accessible controls

### Citizen dashboard

Must make the user's current civic activity visible quickly.

### Admin dashboard

Must prioritize operational clarity over decorative UI.

## 16. Responsive Requirements

The application must remain usable on:

- desktop/laptop
- tablet
- mobile-width browser

Responsive behavior must preserve:

- navigation usability
- form usability
- complaint readability
- action-button accessibility
- dashboard usefulness

Avoid horizontal scrolling for normal usage.

## 17. Data Requirements

The application must persist at least the following conceptual entities.

### User

- unique identifier
- name
- email
- password credential representation
- role
- creation time

### Complaint

- unique identifier
- submitting user reference
- zone
- landmark/address
- category
- description
- optional image reference
- priority score
- keyword/severity contribution
- vote count
- status
- creation time
- update time

### Vote

- unique identifier
- complaint reference
- user reference
- creation time

A user/complaint vote combination must be unique.

The exact storage implementation is an engineering decision and is not dictated by this specification.

## 18. Validation Requirements

The application must validate all important user inputs.

At minimum:

Registration:
- name
- email
- password
- confirmation

Login:
- email
- password

Complaint:
- zone
- landmark/address
- category
- description
- optional image

Vote:
- authenticated user
- valid complaint

Admin status update:
- authenticated admin
- valid complaint
- supported status value

## 19. Error and Empty States

The product must deliberately handle:

- no complaints yet
- no search results
- invalid login
- duplicate registration
- invalid complaint submission
- missing complaint
- duplicate vote
- unauthorized action
- invalid image
- oversized image
- unexpected server error

Messages should be understandable to a student demonstrating the product to a faculty member.

Do not display raw stack traces or low-level implementation errors in the UI.

## 20. API-Level Product Behavior

The product needs capabilities equivalent to:

Authentication:
- register
- login
- current-user/session check

Complaints:
- list
- detail
- create

Voting:
- upvote

Administration:
- summary statistics
- status update

Health/diagnostic:
- application health check

Exact endpoint paths and transport details are implementation decisions unless the existing project has already standardized them.

## 21. Quality Requirements

The finished application should:

- work locally from a documented setup process
- preserve data across restarts
- prevent obvious security mistakes
- have predictable error handling
- have a consistent UI
- avoid unnecessary duplication
- have test coverage for critical business rules
- be understandable to a beginner during a viva/demo

## 22. Performance Expectations

This is an academic MVP, not a production-scale municipal platform.

Do not over-engineer for massive traffic.

Still avoid:

- unnecessary repeated queries
- obviously expensive work on every render
- unbounded file uploads
- loading all data repeatedly when a simple filtered request is appropriate

Optimize for correctness, responsiveness, and maintainability.

## 23. Out of Scope

Do not implement these as part of the MVP unless explicitly requested:

- cloud services
- hosted deployment
- AWS
- Firebase
- Supabase
- maps/GPS
- live location tracking
- machine learning
- AI classification
- image recognition
- external government systems
- SMS
- email notifications
- push notifications
- real municipal ticketing systems
- payment systems
- social login
- microservices
- Kubernetes
- complex analytics platforms

These may be future-extension ideas only.

## 24. Acceptance Criteria

The MVP is complete only when all of the following are true.

### Authentication

- A citizen can register.
- Duplicate email registration is rejected.
- A citizen can log in.
- Invalid login is handled correctly.
- An admin can log in through a controlled account.
- Protected actions reject unauthenticated users.
- Admin-only actions reject citizens.

### Complaints

- A citizen can create a complaint.
- Required fields are validated.
- Optional image attachment works.
- Complaint data persists.
- Complaint details can be viewed.

### Priority

- New complaints receive a priority.
- Priority uses documented severity logic.
- Priority is deterministic.
- Repeated keywords cannot inflate score without bound.
- Upvotes affect priority as specified.

### Voting

- A citizen can upvote.
- Vote count changes after a successful vote.
- A duplicate vote is rejected.
- Duplicate voting cannot be bypassed simply by modifying the UI.

### Administration

- Admin sees complaint list.
- Admin can filter/search/sort.
- Admin sees priority clearly.
- Admin can change status.
- Citizens cannot change status.
- Citizen view reflects status changes.

### UX

- Main pages are visually consistent.
- Forms are readable.
- Empty/error/loading states exist where needed.
- The UI works at common desktop and mobile widths.

### Reliability

- Application starts locally from documented commands.
- Backend tests for critical business rules pass.
- Frontend build succeeds.
- Full end-to-end local user flow succeeds.

## 25. End-to-End Demonstration Scenario

Use this scenario for the final demonstration.

1. Open CivicPulse.
2. Show the landing page.
3. Register a citizen.
4. Log in.
5. Open Report Issue.
6. Create a complaint such as a dangerous gas leak.
7. Provide zone and landmark.
8. Enter a realistic description.
9. Upload an image.
10. Submit.
11. Show the complaint on the dashboard.
12. Show its priority.
13. Use a second citizen account to find the complaint.
14. Upvote it.
15. Show the vote count/priority update.
16. Log in as admin.
17. Open the admin dashboard.
18. Show the complaint near the appropriate priority level.
19. Change Pending to In Progress.
20. Change In Progress to Resolved.
21. Return to the citizen view.
22. Show the updated Resolved status.

The demo should feel like one continuous product journey rather than isolated screenshots.

## 26. Product Completion Standard

CivicPulse should not be considered finished merely because the pages render.

It is finished when a real user can complete the full journey locally:

Register
→ Login
→ Report
→ Store
→ Prioritize
→ Upvote
→ Admin Review
→ Status Update
→ Resolved

with persistence, validation, authorization, clear UI feedback, and no critical broken flow.

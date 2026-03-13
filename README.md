# VSA DT Fabrication Dashboard

![Platform: Google Apps Script](https://img.shields.io/badge/Platform-Google%20Apps%20Script-4285F4?style=flat-square)
![Status: Active](https://img.shields.io/badge/Status-Active-0f766e?style=flat-square)
![Scope: Public Showcase](https://img.shields.io/badge/Scope-Public%20Showcase-7c3aed?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-111827?style=flat-square)

School fabrication workflow dashboard for DT Student Projects, Special Requests, reviewer queue operations, and status communication.

Developed by the VSA Design Technology Department, this repository demonstrates a school workshop fabrication workflow system built on Google Apps Script. It is presented here as a public showcase repository, sanitized for public reference and intended to explain the system clearly to school stakeholders, future maintainers, and technical readers.

## Overview

The VSA DT Fabrication Dashboard is a Google Apps Script web app used to manage laser cutting and 3D printing workflows in a school workshop setting. It brings together submission intake, reviewer triage, production queue handling, status updates, file storage, and workflow emails in one operational tool.

Without a structured system, school fabrication requests can become difficult to track: files arrive through inconsistent channels, approval context gets lost, queue ownership is unclear, and students do not know what is happening next. This dashboard addresses that problem by centralising the workflow from initial submission through review, queueing, production, and completion.

This public repository is not a live deployment export. It is a polished reference version that shows how the system is structured, what it is for, and how it supports day-to-day workshop operations.

## What This Project Is

- A Google Apps Script workshop management tool for school fabrication workflows.
- A role-aware dashboard for students, teachers, technicians, and admins.
- A public showcase version of a departmental operational system.
- A single-file Apps Script application backed by Google Sheets, Google Drive, and MailApp.

## Why This Dashboard Exists

- School fabrication requests are hard to manage when files, approvals, and updates are spread across email threads, chat messages, and informal spreadsheets.
- DT coursework and non-standard workshop jobs need different handling, but still benefit from a shared review and tracking system.
- Students need a clear way to submit files and check status.
- Teachers need visibility into what has been submitted and what needs correction.
- Technicians need a practical reviewer queue, not just a raw spreadsheet.
- Admins need an auditable workflow that can be maintained inside the Google Workspace ecosystem already used by the school.

## Main Workflows

### DT Student Project
- Intended for standard Design Technology coursework submissions.
- Uses year-group rules, machine constraints, material guidance, and file validation.
- Supports laser cutting and 3D printing submissions.

### Special Request
- Intended for requests outside the standard DT coursework path.
- Covers competitions, exhibitions, events, club work, and other sponsored projects.
- Requires more contextual information and responsible teacher or sponsor details.

### Reviewer Queue
- Combines DT Student Projects and Special Requests into one operational queue.
- Supports queue filtering, reviewer triage, repeat-submission awareness, and status transitions.
- Opens a review drawer for detailed checks, remarks, and workflow actions.

### Status Lookup
- Lets requesters search by submission ID, request ID, or email.
- Surfaces current workflow stage, timestamps, and next-step guidance.

### Machine Guide
- Provides machine-oriented guidance for laser cutting and 3D printing.
- Helps users understand file expectations, size constraints, and workshop preparation requirements.

## Operational Value

- Reduces confusion around how files should be submitted.
- Makes approval and queueing more visible.
- Distinguishes DT coursework from Special Requests in a consistent workflow.
- Improves communication between students, teachers, and technicians.
- Gives the workshop team a more structured and trackable operating model.

## Key Features

### Submission workflows
- Dedicated DT Student Project path for standard coursework.
- Dedicated Special Request path for non-standard or sponsored work.
- File upload, validation, and confirmation handling.
- Rule-aware machine and material constraints.

### Review and queue operations
- Reviewer Queue that merges both request sources.
- Review drawer for remarks, status updates, and operational context.
- Status-driven workflow from submission through completion or rejection.
- Submission activity indicators to help reviewers spot repeat or burst submissions.

### User-facing transparency
- Status Lookup for students, teachers, and requesters.
- Clear status progression and next-step messaging.
- Confirmation and review-related email notifications.

### Guidance and onboarding
- Machine Guide for fabrication preparation.
- Help and guidance content for workshop expectations.
- UI cues that distinguish DT Student Projects from Special Requests.

### Operational control
- Role-aware views for students, teachers, technicians, and admins.
- Rules, user, and audit management areas for admins.
- Reviewer-friendly filtering across source, year, status, machine, and requester context.

### Auditability and maintainability
- Google Sheets-backed record keeping.
- Audit log for workflow actions.
- Public documentation set for maintainers and reviewers.

## Who Uses It

- Students submitting DT Student Projects.
- Teachers supporting coursework and sponsored requests.
- Technicians managing fabrication review and queue operations.
- Admins maintaining workflow rules, users, and records.
- School stakeholders reviewing how the department operates its fabrication workflow.

## System Architecture Summary

The dashboard is hosted as a Google Apps Script web app.

- Google Apps Script provides the server-side runtime and web app host.
- Google Sheets stores structured workflow records.
- Google Drive stores uploaded working files and preview assets.
- MailApp sends workflow notifications and submission confirmations.
- `code.gs` contains the application logic, page renderers, inline CSS, and inline client-side JavaScript.

This single-file architecture is deliberate. It is not the most modular format, but it aligns well with Apps Script deployment and keeps the project easy to move into a fresh Apps Script project when needed.

For a fuller architecture explanation, see [docs/TECHNICAL_OVERVIEW.md](docs/TECHNICAL_OVERVIEW.md).

## Data Model Summary

- `Submissions`: DT Student Project records.
- `OtherRequests`: Special Request records.
- `Rules`: machine and year-group validation rules.
- `IssueTemplates`: reusable reviewer feedback templates.
- `Users`: role and access assignments.
- `AuditLog`: workflow actions and state changes.

These are logical data structures backed by Google Sheets rather than a separate database platform.

## Repository Structure

- `code.gs`: main Apps Script application.
- `README.md`: public-facing project overview.
- `CHANGELOG.md`: release notes and public documentation changes.
- `GITHUB_PUBLISHING.md`: checklist for preparing future sanitized public pushes.
- `docs/TECHNICAL_OVERVIEW.md`: architecture, code map, persistence model, and risk areas.
- `docs/HANDOVER.md`: maintenance and deployment guide for future VSA DT maintainers.
- `docs/assets/screenshots/`: screenshot placeholders and naming guidance for future demo captures.
- `docs/assets/diagrams/`: diagram placeholders and documentation assets.

## Documentation Map

Read these in order if you want to understand the repository quickly:

1. [README.md](README.md) for the public overview.
2. [docs/TECHNICAL_OVERVIEW.md](docs/TECHNICAL_OVERVIEW.md) for architecture and code structure.
3. [docs/HANDOVER.md](docs/HANDOVER.md) for maintenance, deployment, and QA guidance.
4. [GITHUB_PUBLISHING.md](GITHUB_PUBLISHING.md) for public repo preparation and sanitization rules.
5. [CHANGELOG.md](CHANGELOG.md) for release-level changes in the public showcase.

## Screenshots and Demo

This repository does not currently include production screenshots. The recommended structure for future public demo assets is documented in [docs/assets/screenshots/README.md](docs/assets/screenshots/README.md).

Suggested screenshot groups:

- student DT submit flow
- student Special Request flow
- Status Lookup page
- Machine Guide page
- admin Reviewer Queue
- review drawer
- help and guidance pages

Recommended asset paths:

```text
docs/assets/screenshots/dt-submit-flow.png
docs/assets/screenshots/special-request-flow.png
docs/assets/screenshots/status-lookup.png
docs/assets/screenshots/machine-guide.png
docs/assets/screenshots/reviewer-queue.png
docs/assets/screenshots/review-drawer.png
docs/assets/screenshots/help-guidance.png
docs/assets/diagrams/system-overview.png
```

## Public Showcase and Sanitization Note

This repository is sanitized for public reference.

- Placeholder values are used instead of live staff contacts.
- Personal emails, deployment URLs, spreadsheet IDs, folder IDs, and private operational data must not be committed.
- Publicly shown machine information should be reviewed for accuracy before publication.
- The repository is intended for reference, demonstration, documentation, and handover support.

If the live system continues to evolve internally, the public branch should remain a deliberately reviewed and sanitized version.

## What This Repo Is Not

- Not a generic public manufacturing platform.
- Not a hosted SaaS product.
- Not a substitute for CAD or design software.
- Not a full school MIS or student information system.
- Not a full CAD/CAM pipeline.

## Setup Overview

At a high level, setting up the app involves:

1. creating a Google Apps Script project
2. adding `code.gs`
3. authorising required Google services
4. running the bootstrap/setup flow
5. verifying the generated spreadsheet, folders, and seeded data
6. deploying the project as a web app

See [docs/HANDOVER.md](docs/HANDOVER.md) for the practical maintenance and deployment guidance.

## Deployment Summary

This public repo does not contain live deployment values. A real deployment requires local or private configuration review for:

- teacher email mappings
- technician mailbox values
- access settings
- Google Drive ownership and permissions
- spreadsheet ownership and seeded records

The safest pattern is to keep live deployment values in a private fork or private branch, while preserving this repository as a clean public showcase.

## Known Limitations

- The application is intentionally kept in a single large `code.gs` file.
- There is no automated test suite in this repository.
- Google Sheets is a pragmatic store for school-scale operations, not a full transactional database.
- Public demo assets are not yet included.
- Real deployment details are intentionally omitted from the public branch.

## Future Improvements

Possible future directions for the project include:

- modularising `code.gs` into a more maintainable multi-file structure
- exportable analytics or reporting dashboards
- stronger machine scheduling support
- richer attachment preview handling
- reviewer bulk actions
- more robust deployment tooling
- structured QA routines or lightweight automated checks

These are future directions, not current promises.

## License and Ownership Note

This repository is released under the MIT License. See [LICENSE](LICENSE).

The dashboard itself was developed by the VSA Design Technology Department as a school fabrication workflow tool. This public repository is a showcase version prepared for reference, collaboration, and departmental documentation rather than a full live deployment export.
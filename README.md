# Design Fabrication Dashboard

A Google Apps Script workflow dashboard for managing school fabrication requests, including DT coursework submissions, special fabrication requests, technician review, queueing, production tracking, and status notifications.

This repository is a public showcase version. Private staff details, school email addresses, and deployment-specific values have been replaced with sample placeholders.

## What This System Does

The dashboard supports the full lifecycle of workshop requests:

1. A requester submits a laser cutting or 3D printing job.
2. The system validates dimensions, file types, and required metadata.
3. Reviewers triage submissions in an operational admin queue.
4. Technicians or admins update statuses through a review drawer.
5. The system sends workflow emails and stores an audit trail.
6. Students, teachers, and requesters can check live status later.

The app is designed for school use, but the architecture is general enough for other small workshop-style review queues.

## Main Workflows

### 1. DT Coursework Submission
- Intended for standard DT student work.
- Uses year-group rules for size limits, materials, and accepted file types.
- Supports laser cutting and 3D printing.
- Includes file upload, validation, confirmation, and later status tracking.

### 2. Special Fabrication Request
- Intended for non-standard or non-DT requests such as competitions, clubs, exhibitions, and cross-department projects.
- Requires a responsible teacher or sponsor.
- Captures more context such as project purpose, deadline, quantity, approval email, and request notes.

### 3. Reviewer Queue
- Merges DT submissions and Special Requests into one operational queue.
- Supports filtering by source, year, machine, status, teacher, class, requester email, and teacher-scoped views.
- Highlights active jobs, repeat activity, and workflow ownership.
- Opens a detailed review drawer for status changes and reviewer remarks.

### 4. Status Lookup
- Lets students, teachers, or requesters search by email or submission/request ID.
- Shows current status, workflow progress, timestamps, and role-aware next-step guidance.

## Core Features

- Single-file Google Apps Script web application.
- Google Sheets-backed data storage.
- Google Drive-backed file uploads.
- Role-aware views for students, teachers, technicians, and admins.
- DT vs Special Request source distinction throughout the UI.
- Submission activity tracking for same-day and last-24h bursts.
- Review drawer with operational summary, status update controls, and requester history.
- Status emails for confirmations and review feedback.
- Machine guide and help system for onboarding and self-service support.
- Audit logging for workflow changes.

## Roles

### Student / Requester
- Submit jobs.
- Check job status.
- Respond to Needs Fix / revision requests.

### Teacher
- View scoped queue items when using teacher filters.
- Support students or sponsored requests.
- Monitor progress and advise on corrections.

### Technician
- Review, queue, and progress fabrication work.
- Use the admin queue and drawer to operate daily workflow.

### Admin
- Full queue access.
- Full status control.
- Rules, users, and audit visibility.

## Status Workflow

The system uses these main statuses:

- `submitted`
- `needs_fix`
- `approved`
- `in_queue`
- `in_production`
- `completed`
- `rejected`

These statuses drive queue treatment, owner/action hints, user-facing messaging, and email notifications.

## Data Stored

The system uses Google Sheets with these logical tables:

- `Submissions`: DT workflow requests.
- `OtherRequests`: Special Request workflow records.
- `Rules`: machine and year-group rules.
- `IssueTemplates`: reusable feedback templates.
- `Users`: role assignments.
- `AuditLog`: status changes and operational actions.

Uploaded files are stored in Google Drive, with records keeping file IDs, names, and URLs.

## Repository Structure

- `code.gs`: entire application source.
- `README.md`: overview for GitHub readers.
- `CHANGELOG.md`: snapshot-level project change notes.
- `docs/TECHNICAL_OVERVIEW.md`: architecture and key code areas.
- `docs/HANDOVER.md`: maintenance and deployment guidance.
- `.gitignore`: local noise exclusions.
- `LICENSE`: repository license.

## Architecture Notes

This app is intentionally kept in one large `code.gs` file. That file contains:

- Apps Script server functions.
- HtmlService page rendering.
- inline CSS.
- inline client-side JavaScript.

That architecture is not the most modular, but it is practical for Apps Script deployment and easy to copy into a fresh GAS project.

## Public Showcase Sanitization

This repository intentionally uses sample-safe placeholders for:

- teacher email mappings
- technician CC email
- school email examples
- deployment-specific contact details

Before using this in a real deployment, replace those placeholder values with your own organisation’s configuration.

## How To Understand The System Quickly

If you are new to the codebase, read in this order:

1. `README.md`
2. `docs/TECHNICAL_OVERVIEW.md`
3. `docs/HANDOVER.md`
4. `code.gs`

Inside `code.gs`, the most important areas are:

- top-level `APP` config
- submission APIs
- status update functions
- email notification functions
- `renderPage_()` and page renderers
- admin queue rendering and review drawer logic

## Deployment Summary

This app is intended to be deployed as a Google Apps Script web app.

Typical setup flow:

1. Create a new Apps Script project.
2. Paste in `code.gs`.
3. Run the auth/bootstrap helpers.
4. Deploy as a web app.
5. Replace placeholder contacts and teacher mappings.
6. Connect the resulting spreadsheet/users/rules to your organisation.

See `docs/HANDOVER.md` for a more practical deployment and maintenance guide.

## Intended Audience For This Repository

This repo is useful for:

- schools managing workshop requests
- teachers building internal workflow tools
- Google Apps Script developers interested in a large single-file app
- anyone designing review queues with status tracking and operational UX

## Notes

- This repository is a public showcase, not a live production export.
- It does not include real staff emails or private organisation data.
- If you reuse it, audit all placeholders and deployment settings before going live.
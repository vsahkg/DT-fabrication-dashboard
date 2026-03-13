# Technical Overview

This document explains how the VSA DT Fabrication Dashboard is structured and how the main application areas fit together.

For the public project overview, start with [../README.md](../README.md). For operational maintenance guidance, see [HANDOVER.md](HANDOVER.md).

## Top-Level Architecture Summary

The dashboard is a single-file Google Apps Script web application stored in `code.gs`.

It combines four layers in one Apps Script file:

1. configuration and seeded sample data
2. server-side Apps Script functions
3. HTML rendering through HtmlService
4. inline CSS and client-side JavaScript

This is a deployment-oriented architecture. It is less modular than a multi-file web app, but it keeps the system portable inside the Apps Script environment and matches how the project is actually maintained.

## Platform Responsibilities

- Google Apps Script hosts the web app and runs server-side logic.
- Google Sheets stores the structured operational records.
- Google Drive stores uploaded files and preview assets.
- MailApp sends confirmation and workflow notification emails.

## Rendering Structure

### Entry point
- `authorizeScopes()` is used to trigger the Google authorisation flow when needed.
- `bootstrap()` creates and seeds the basic project structure.
- `doGet(e)` is the main web entry point.

### Page assembly
- `doGet(e)` resolves the requested page and current user context.
- `renderPage_()` builds the full HTML shell.
- `renderPage_()` embeds all CSS, the boot payload, all page HTML, and the client-side JavaScript.

### Page renderers
Important page renderers include:

- `renderSubmitPage_()`
- `renderOtherRequestPage_()`
- `renderStatusPage_()`
- `renderAdminPage_()`
- `renderMachinesPage_()`
- `renderHelpPage_()`

Because those renderers use large template strings, they are among the most regression-sensitive parts of the codebase.

## Major Function Groups

### Configuration and seeded content
The top-level `APP` object contains the main configuration surface.

Important areas include:

- `APP.sheets` for logical sheet definitions
- `APP.status` for workflow statuses
- `APP.sampleRules` for seeded rule data
- `APP.sampleIssues` for seeded issue templates
- `APP.uiText` for user-facing wording
- `APP.teacherEmails` and `APP.technicianCcEmail` for notification-related configuration

### Submission and validation
The two main submission paths are handled by:

- `submitSubmission()` for DT Student Projects
- `submitOtherRequest()` for Special Requests

These flows depend on validation helpers, record creation, audit entries, and confirmation emails.

### Status lookup and queue data
User-facing and reviewer-facing retrieval is primarily handled by:

- `getStudentStatuses()`
- `getOtherRequestStatuses()`
- `getAdminRows()`
- `getAdminOtherRequests()`
- `getSubmissionActivity()` and related helpers

### Status updates and reviewer actions
Reviewer workflow actions are mainly handled by:

- `updateSubmissionStatus()`
- `updateOtherRequestStatus()`

These functions update workflow state, write audit records, and trigger notifications.

### Notifications
Workflow emails are mainly handled by:

- `sendSubmissionConfirmation_()`
- `sendOtherRequestConfirmation_()`
- `sendStatusNotification_()`
- `sendOtherRequestNotification_()`

### Admin maintenance
The admin area uses functions for:

- rule retrieval and updates
- user retrieval and updates
- issue template management
- audit log retrieval

## Persistence Model

The app uses Google Sheets as its structured store.

Logical tables include:

- `Submissions` for DT Student Project records
- `OtherRequests` for Special Request records
- `Rules` for fabrication and validation constraints
- `IssueTemplates` for reviewer feedback templates
- `Users` for role and access mappings
- `AuditLog` for workflow activity tracking

The general persistence pattern is:

1. client-side JavaScript sends a request with `google.script.run`
2. server-side Apps Script validates or filters the request
3. rows are appended or updated in Google Sheets
4. Drive files are created when uploads are involved
5. notifications and audit entries are written as part of the same workflow

## Notification Flow

The notification model is intentionally tied to status changes.

- Submission confirmation emails are sent after successful form submission.
- Needs Fix emails include corrective context and copied recipients where appropriate.
- Status update functions decide whether an email should be sent and to whom.
- Notification results are reflected in the audit trail.

The email layer is operationally important because it is one of the main ways the dashboard keeps students, teachers, and technicians aligned without relying on separate manual follow-up.

## Queue and Admin Logic

The Reviewer Queue is a merged operational view over DT Student Projects and Special Requests.

Key characteristics:

- source-aware rows across both workflows
- filters for status, year, machine, requester, and teacher context
- role-aware queue scoping
- status-driven action hints
- row-level activity context for repeated submissions
- review drawer access for detailed workflow actions

The queue is designed to be the summary layer, while the review drawer acts as the detail layer.

## Role-Aware UI Model

The UI adapts to the user role determined at runtime.

- Students and guest-level users focus on submission, status, machine guidance, and help.
- Teachers gain scoped queue visibility.
- Technicians gain queue operation access.
- Admins gain rules, users, and audit views.

This role-aware rendering is handled through the boot payload and the page shell logic in `renderPage_()`.

## Current Snapshot Highlights

The current public snapshot includes these notable operational improvements:

- repeat-submission and last-24-hour activity signals
- stronger reviewer queue hierarchy
- richer review drawer context
- file-size guardrails in uploads
- document locking around status changes
- clearer Needs Fix messaging
- expanded Machine Guide and help content

## Regression-Sensitive Areas

These are the parts of the system most likely to break during edits:

- large template literals in page renderers
- inline client-side JavaScript embedded in `renderPage_()`
- queue row rendering helpers
- review drawer rendering logic
- status enum usage across server and client code
- sheet header definitions versus actual sheet columns
- email text and recipient logic

## Areas Most Likely To Break During Edits

Practical examples of fragile edit points:

- changing field names without updating both sheet headers and runtime keys
- altering workflow statuses without updating filters, labels, and notifications
- editing HTML template strings without checking interpolation and escaping
- changing user-facing wording in one place while forgetting related pages
- adding new private deployment values and forgetting to sanitize them before publishing

## Recommended Editing Approach

- Make small, deliberate changes.
- Re-run syntax or editor error checks after each edit session.
- Treat queue and drawer updates as coupled UI work.
- Keep live deployment configuration out of the public branch.

## Related Documentation

- [../README.md](../README.md)
- [HANDOVER.md](HANDOVER.md)
- [../GITHUB_PUBLISHING.md](../GITHUB_PUBLISHING.md)
- [../CHANGELOG.md](../CHANGELOG.md)
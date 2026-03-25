# Technical Overview

This document explains how the current `code.gs` implementation is organised and where the main operational responsibilities live.

For the broader repository overview, see [../README.md](../README.md). For maintenance and rollout guidance, see [HANDOVER.md](HANDOVER.md).

## Architecture Summary

The application is a single-file Google Apps Script web app.

That one file contains four tightly coupled layers:

1. top-level configuration and seeded data
2. server-side workflow and persistence functions
3. HTML page renderers
4. inline CSS and client-side JavaScript

This is deployment-friendly inside Apps Script, but it makes changes more fragile than in a modular web application.

## Top-Level Configuration Surface

The `APP` object is the main configuration surface.

Important sections include:

- `APP.sheets` for all sheet definitions
- `APP.sampleRules` for seeded fabrication rules
- `APP.sampleIssues` for seeded issue templates
- `APP.status` for the workflow enum
- `APP.uiText` for shared user-facing wording
- `APP.teacherEmails` for teacher-name to email resolution
- `APP.adminEmailOverrides` for elevated-role email overrides
- `APP.technicianCcEmail` for threaded `Needs Fix` communication

Other important constants outside `APP` include:

- `TECHNICIAN_ALLOWED_STATUSES`
- `PREVIEW_IMAGE_EXTENSIONS`
- `MACHINE_SPECS`

## Bootstrapping and Entry Points

### One-time / setup entry points

- `authorizeScopes()` triggers Mail, Drive, and Spreadsheet authorisation
- `bootstrap()` creates folders, spreadsheet, sheets, seed rows, and script properties
- `setup()` is just an alias to `bootstrap()`

### Web entry point

- `doGet(e)` resolves the requested page, role context, rules payload, status options, and UI text before rendering the page shell

## Rendering Model

`renderPage_()` builds the full HTML document, including:

- role-adaptive navigation
- page container switching
- all inline CSS
- boot payload serialisation
- all client-side JavaScript

### Main page renderers

- `renderSubmitPage_()`
- `renderOtherRequestPage_()`
- `renderStatusPage_()`
- `renderAdminPage_()`
- `renderMachinesPage_()`
- `renderHelpPage_()`
- `renderRulesPage_()`
- `renderUsersPage_()`
- `renderAuditPage_()`

These renderers are regression-sensitive because they rely on very large template strings.

## Persistence Model

The app uses Google Sheets as its structured store and Google Drive for files.

Current logical tables:

- `Submissions`
- `Rules`
- `SubmissionControls`
- `IssueTemplates`
- `Users`
- `AuditLog`
- `OtherRequests`

General write pattern:

1. client JS calls a server function with `google.script.run`
2. server validates payload and resolves access
3. rows are appended or updated in Google Sheets
4. Drive files are created for uploads
5. audit and email side effects are applied

## Submission and Validation Functions

### DT workflow

- `submitSubmission()` writes DT submission rows
- `validateSubmission_()` enforces required fields, file rules, dimension limits, and prototype type
- `getSubmissionControlDecision_()` checks whether a year group or class submission window is closed

### Special Request workflow

- `submitOtherRequest()` writes `OtherRequests`
- `validateOtherRequest_()` enforces its extended field set

### Shared helpers

- `getMatchingRule_()`
- `getFileExtension_()`
- `parseRequiredDimension_()`
- `parseOptionalDimension_()`
- `formatPrototypeFidelityLabel_()`

## Submission Activity and Queue Context

The current implementation includes repeat-submission awareness.

Important functions:

- `getTodaySubmissionCountByEmail_()`
- `getSubmissionActivityMap_()`
- `getSubmissionActivityByEmail_()`
- `attachSubmissionActivity_()`
- `getSubmissionActivity()`

This data feeds:

- duplicate reminders on the submit pages
- last-24-hour indicators
- reviewer queue risk pills
- review drawer context

## Reviewer Queue and Status Functions

### Lookup and queue data

- `getStudentStatuses()`
- `getOtherRequestStatuses()`
- `getAdminRows()`
- `getAdminOtherRequests()`
- `attachStudentFeedback_()`

### Status updates

- `updateSubmissionStatus()`
- `updateOtherRequestStatus()`

Both status update functions:

- enforce allowed statuses
- apply role restrictions
- acquire a workflow lock
- update sheet fields
- append audit entries
- trigger notifications when the status actually changes

## Email and Communication Functions

### Automatic communication

- `sendSubmissionConfirmation_()`
- `sendOtherRequestConfirmation_()`
- `sendStatusNotification_()`
- `sendOtherRequestNotification_()`

### Reviewer-composed communication

- `generateEmailDraft()`
- `generateTeacherUpdateDraft()`
- `sendComposedEmail()`
- `normalizeEmailList_()`

The manual draft tooling is a meaningful part of the current operational design and should be documented whenever reviewer workflow changes are made.

## Admin Configuration Functions

- `getAdminRulesRows()`
- `saveAdminRule()`
- `getAdminSubmissionControlRows()`
- `saveAdminSubmissionControl()`
- `getAdminUsersRows()`
- `saveAdminUser()`
- `addAdminUser()`
- `getAuditLogRows()`

`saveAdminSubmissionControl()` is especially important because it governs deadline, cutoff, and reopen behaviour for DT submission scopes.

## Auth and Identity Resolution

The app resolves users from multiple sources.

Relevant functions:

- `getTeacherListEntryByEmail_()`
- `getConfiguredUserOverride_()`
- `getCurrentUser_()`
- `requireAdmin_()`
- `resolveTeacherEmail_()`
- `isTeacherRecordMatch_()`

Role resolution currently blends:

- sheet-based `Users`
- hardcoded teacher mappings
- hardcoded admin override emails

That means documentation and deployment notes must treat these values as operational configuration, not just demo placeholders.

## Storage and Setup Helpers

- `getSpreadsheet_()`
- `getRootFolder_()`
- `getSheet_()`
- `acquireWorkflowLock_()`
- `getRowsAsObjects_()`
- `appendObject_()`
- `writeCellByHeader_()`
- `getOrCreateRootFolder_()`
- `getOrCreateMasterSpreadsheet_()`
- `createFolderTree_()`
- `getUploadFolder_()`
- `ensureSheet_()`
- `seedRules_()`
- `seedIssueTemplates_()`
- `reseedIssueTemplates()`
- `seedUsers_()`

## Current UI Model

The UI is role-adaptive.

- students and guests get submit, status, machines, special-request, and help flows
- teachers get queue access scoped to their students
- technicians get queue-first navigation and production-focused status control
- admins get rules, users, audit, and full dashboard access

The page shell, nav labels, and page availability are all generated at render time, so nav and access changes should be treated as cross-cutting edits.

## Regression-Sensitive Areas

The most fragile parts of the current codebase are:

- large template literals in page renderers
- client JS embedded inside `renderPage_()`
- queue-table rendering and drawer rendering
- role-adaptive navigation branches
- `SubmissionControls` matching and sort logic
- teacher mapping plus submit-page dropdown consistency
- sheet header definitions versus runtime field names
- email recipient logic and threaded `Needs Fix` behaviour

## Recommended Editing Approach

- make small, intentional edits
- validate after touching template strings
- treat status logic, emails, and queue UI as coupled work
- update docs whenever statuses, fields, nav labels, or admin tooling change
- review public-safety impact whenever contact mappings or config constants change

## Related Documentation

- [../README.md](../README.md)
- [HANDOVER.md](HANDOVER.md)
- [../GITHUB_PUBLISHING.md](../GITHUB_PUBLISHING.md)
- [../CHANGELOG.md](../CHANGELOG.md)
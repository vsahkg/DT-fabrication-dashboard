# Handover Guide

This guide is for future maintainers or anyone adapting the dashboard for workshop operations.

For the project overview, read [../README.md](../README.md). For architecture notes, read [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md). For publication rules, read [../GITHUB_PUBLISHING.md](../GITHUB_PUBLISHING.md).

## What This Repository Is

This repository is the source snapshot for a Google Apps Script fabrication workflow tool.

It is useful for:

- understanding the workflow design
- maintaining or extending the current implementation
- preparing future deployment copies
- preparing a sanitised GitHub publication

It should not be assumed to be a fully scrubbed public export at all times. Review configuration carefully before publishing.

## Before Real Deployment

Review these configuration surfaces in `code.gs`:

- `APP.technicianCcEmail`
- `APP.teacherEmails`
- `APP.teacherBetaClasses`
- `APP.adminEmailOverrides`
- `APP.uiText`

Also confirm:

- spreadsheet ownership and sharing
- Drive folder permissions
- Apps Script deployment access policy
- MailApp quota and sender behaviour
- user rows in the `Users` sheet
- `Rules` and `SubmissionControls` rows match the intended policy

## Working With A Single-File GAS Project

### Make focused edits

UI, client logic, and shared wording are deeply interleaved inside template strings. Broad edits increase break risk.

### Validate after each change

After editing `code.gs`, check Apps Script syntax and the rendered web app before considering the change done.

### Keep headers stable

Sheet headers and runtime object keys are tightly coupled. If you rename a header, you must update all read and write logic that depends on it.

### Watch for config drift

Teacher mappings, class-tracker rosters, admin override emails, submit-page dropdown options, and public docs can drift apart if changed independently.

## Where To Edit Common Things

### Rules and validation

- `APP.sampleRules` seeds default rows
- `Rules` sheet stores live rule rows
- `getMatchingRule_()` and `validateSubmission_()` enforce them

### Submission cutoff windows

- `SubmissionControls` sheet stores deadline and closure rows
- `getSubmissionControlDecision_()` resolves effective state
- `saveAdminSubmissionControl()` is the admin write path

### User-facing wording

- shared strings live in `APP.uiText`
- page-specific copy also lives in `renderSubmitPage_()`, `renderOtherRequestPage_()`, `renderMachinesPage_()`, and `renderHelpPage_()`

### Teacher and admin identity mapping

- teacher mappings live in `APP.teacherEmails`
- Class Submission tracker rosters live in `APP.teacherBetaClasses`
- elevated-role email overrides live in `APP.adminEmailOverrides`
- submit-page teacher dropdown content is hardcoded in `renderSubmitPage_()`

The public GitHub snapshot uses generic teacher labels and synthetic demo rosters. A live deployment should replace those values privately and keep the replacement out of public commits.

### Notification behaviour

- automatic emails: `sendSubmissionConfirmation_()`, `sendOtherRequestConfirmation_()`, `sendStatusNotification_()`, `sendOtherRequestNotification_()`
- manual drafts: `generateEmailDraft()`, `generateTeacherUpdateDraft()`, `sendComposedEmail()`

### Queue and review UX

- `getAdminRows()` and `getAdminOtherRequests()` assemble queue data
- queue rendering and drawer rendering live in the client JS inside `renderPage_()`
- repeat-submission context comes from the `getSubmissionActivity*` helper family

### Class Submission tracker

- `renderTeacherBetaPage_()` renders the teacher/admin class status UI
- `getTeacherBetaClassStatus()` loads interactive page data
- `getTeacherBetaClassStatusCsv_()` and the `teacher_class_csv` action support spreadsheet export
- roster status compares expected class emails against submission rows, so email and class-number data quality directly affects results

## Common Risks

- breaking a template literal while editing HTML or JS
- renaming a sheet header without updating all dependent code
- changing a status without updating queue labels, notifications, and help text
- changing teacher mappings but forgetting the submit-page dropdown
- changing class-tracker rosters but forgetting teacher scoping or public sanitisation
- updating deadline / cutoff logic without re-testing DT submission blocking
- publishing school-specific contact values unintentionally

## Recommended Setup Process

1. create a new Apps Script project
2. paste in `code.gs`
3. run `authorizeScopes()`
4. run `bootstrap()`
5. review the generated spreadsheet and folder tree
6. update school-specific config values as needed
7. review `Rules`, `Users`, and optional `SubmissionControls`
8. deploy as web app
9. perform end-to-end testing with at least one student, one teacher, and one technician/admin account

## What To Check Before Deployment

- `APP.teacherEmails` matches the real staff list
- `APP.teacherBetaClasses` contains only intended live rosters and is not copied into public GitHub without sanitisation
- submit-page teacher dropdown options match the mapping
- `APP.technicianCcEmail` is correct
- `APP.adminEmailOverrides` only contains intended elevated accounts
- `Rules` match current workshop policy
- `SubmissionControls` rows are current and intentional
- Drive uploads land in the expected folders
- automatic emails reach the intended recipients
- Machines and Help content still match the real workshop setup

## Manual QA Checklist

After meaningful changes, verify:

1. DT submission works end to end
2. Special Request submission works end to end
3. blocked DT classes or year groups are actually blocked when a cutoff row applies
4. status lookup returns both DT and Special Request rows correctly
5. teacher queue scoping still works
6. Class Submission loads for teacher/admin roles, filters by teacher/class, and exports CSV
7. technician status restrictions still work
8. review drawer opens the correct record
9. manual draft generation works for student and teacher emails
10. status changes write to sheets and `AuditLog`
11. automatic emails still send correctly
12. Machines and Help pages render correctly on desktop and mobile
13. no new syntax or editor errors are reported in `code.gs`

## Public Publishing Discipline

Before pushing to a public GitHub repo, confirm the repository does not expose:

- real staff email addresses unless intentionally public
- internal spreadsheet IDs
- Drive folder IDs
- deployment URLs
- screenshots with private data
- internal-only notes

Review these areas carefully:

- top-level config values in `code.gs`
- email examples and footer text
- docs wording that implies a sanitised snapshot when the branch is not yet sanitised
- screenshots and diagrams under `docs/assets/`

## If This Workspace Came From A ZIP Download

This workspace may not contain `.git` metadata.

If so, do not assume you can push immediately. First either:

1. initialise a local git repository and connect the correct remote, or
2. sync these files into a clean clone of the target GitHub repository

That avoids accidental history loss or pushing from the wrong origin.

## Suggested Maintenance Discipline

- keep code changes small and validated
- update docs whenever workflows, roles, or sheet fields change
- treat queue, email, and status changes as one combined review area
- review publication safety before every GitHub push

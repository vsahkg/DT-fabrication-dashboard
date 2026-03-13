# Handover Guide

This document is intended for future VSA Design Technology Department maintainers and for anyone adapting the dashboard in a school workshop environment.

For the public project overview, read [../README.md](../README.md). For architecture detail, read [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md). For public publication rules, read [../GITHUB_PUBLISHING.md](../GITHUB_PUBLISHING.md).

## What This Repository Is

This repository is a public showcase version of the VSA DT Fabrication Dashboard.

It is useful for:

- understanding how the system works
- adapting the project for future maintenance
- documenting departmental workflow design
- preparing future sanitized public releases

It is not a full live deployment export.

## Before Real Deployment

Review and replace public placeholders in `code.gs` before using the app in a live school environment.

Key configuration areas:

- `APP.teacherEmails`
- `APP.technicianCcEmail`
- email example placeholders shown in forms and help text
- wording or branding in `APP.uiText`

Also verify:

- spreadsheet ownership and access
- Google Drive folder ownership and permissions
- Apps Script deployment access settings
- MailApp quota and organisation policy
- user role assignments in the `Users` sheet

## Safe Editing Practices In A Single-File Apps Script Project

### Make focused edits
Most UI and client logic are embedded in large template strings. Wide edits increase the chance of syntax problems and broken rendering.

### Validate after each change
After editing `code.gs`, check syntax and editor-reported errors before treating the change as complete.

### Keep data headers stable
The sheet headers and runtime field names are tightly coupled. Avoid renaming them casually.

### Keep public and private configuration separate
If the repository stays public, keep live deployment values in a private branch or private fork.

## Where To Edit Common Things

### Rules and fabrication constraints
- Seeded defaults are defined in `APP.sampleRules`.
- Live operational changes may also be made in the `Rules` sheet after bootstrap.

### User-facing wording
- Many shared strings live in `APP.uiText`.
- Page-specific wording also appears in renderer template strings such as `renderSubmitPage_()`, `renderOtherRequestPage_()`, `renderMachinesPage_()`, and `renderHelpPage_()`.

### Teacher and notification emails
- Teacher mappings live in `APP.teacherEmails`.
- The technician mailbox lives in `APP.technicianCcEmail`.
- Notification behavior is handled in `sendStatusNotification_()` and `sendOtherRequestNotification_()`.

### Queue and review UX
- Queue data is assembled in `getAdminRows()` and `getAdminOtherRequests()`.
- Queue rendering and queue CSS live in the page shell and client logic inside `renderPage_()`.
- Review drawer behavior is tied to the same client-side layer and related helper functions.

### Machines and guidance content
- Machine information is rendered through `renderMachinesPage_()` and supporting constants.
- General help content is rendered through `renderHelpPage_()`.

## Common Risks

- breaking a template literal during a UI edit
- changing a status code without updating all related logic
- renaming a sheet header without updating server-side reads and writes
- changing queue row structure without checking the drawer and mobile layout
- adding live contact values and forgetting to sanitize them before publication

## Recommended Setup Process

1. create a new Google Apps Script project
2. add the current `code.gs`
3. run `authorizeScopes()` if needed
4. run `bootstrap()` to create the backing structure
5. review seeded rules, users, and issue templates
6. replace public placeholder contacts in a private branch or deployment copy
7. deploy as a web app
8. test with at least one student, one teacher, and one technician/admin account

## What To Check Before Deployment

- teacher email mappings are correct
- technician mailbox is correct
- rules match the intended year-group and machine policy
- users and roles are configured correctly
- Drive uploads are writing to the intended folder structure
- status emails are reaching the correct recipients
- Machine Guide wording matches the real workshop setup

## Manual QA / UAT Checklist

After meaningful changes, verify:

1. DT Student Project submission still works end to end
2. Special Request submission still works end to end
3. Status Lookup returns the correct records
4. Reviewer Queue loads and filters correctly
5. teacher-scoped queue behavior still works
6. clicking Review or View opens the correct drawer item
7. status changes still update sheets, UI, and audit records
8. workflow emails still send as intended
9. Machine Guide and Help pages still render correctly
10. mobile queue layout still stacks cleanly
11. no syntax or editor errors are reported in `code.gs`

## How To Keep The Public Repo Sanitized

Before pushing public changes, confirm that the repo does not expose:

- real staff or personal email addresses
- live spreadsheet or Drive IDs
- private deployment URLs
- screenshots with real user data
- internal-only operational notes that should remain private

Areas to review carefully:

- top-level config values in `code.gs`
- help text and footer wording
- screenshot assets under `docs/assets/`
- README and handover wording that may drift toward live deployment specifics

## Suggested Maintenance Discipline

- keep the public repo focused on documentation and showcase clarity
- keep live operational customization in a private branch or private fork
- update docs whenever terminology or workflow behavior changes
- record major public-facing changes in `CHANGELOG.md`
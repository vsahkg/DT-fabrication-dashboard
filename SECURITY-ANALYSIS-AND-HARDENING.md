# Security Analysis and Hardening

Date: 2026-05-05
System: Design Fabrication Dashboard, Google Apps Script web app

## Scope

This pass reviewed the live Apps Script source files used by the dashboard:

- `00_ConfigAndReadiness.js`
- `10_WebAndSubmissionApi.js`
- `20_WorkflowEmailValidation.js`
- `30_DataAdminSetup.js`
- `80_UiShell.js`
- `90_UiPages.js`

The focus was protection of student data, teacher/technician/admin role boundaries, upload handling, public server functions, status lookup privacy, and browser-side injection risks.

## External Platform Notes

Google Apps Script identity behavior matters for this project:

- `Session.getActiveUser().getEmail()` can be unavailable in some web-app execution modes, especially when the app is deployed to run as the developer rather than the visiting user.
- `Session.getEffectiveUser()` returns the account under whose authority the script runs, which must not be used as the visiting user's identity for authorization.
- `HtmlService.XFrameOptionsMode.ALLOWALL` allows any site to iframe the web app. Google documents that this needs separate clickjacking protection. The safer default is `DEFAULT`.

References:

- Google Apps Script Session reference: https://developers.google.com/apps-script/reference/base/session
- Google Apps Script XFrameOptionsMode reference: https://developers.google.com/apps-script/reference/html/x-frame-options-mode
- Google Apps Script HTML service restrictions: https://developers.google.com/apps-script/guides/html/restrictions

## Main Risks Found

### P0: Effective User Used as Visitor Identity

Risk: `getCurrentUser_()` previously fell back from active user email to effective user email. In a web app deployed as the script owner/deployer, this can accidentally treat every visitor as the script owner/admin.

Fix:

- Removed the authorization fallback to `Session.getEffectiveUser()`.
- `getCurrentUser_()` now uses only the active visitor email for role resolution.
- If no active email is available, the visitor is treated as a student/non-admin.

Residual deployment requirement:

- Keep production access restricted to the school domain.
- Prefer a deployment mode where the active domain user email is available for role checks.
- If active email is unavailable in a deployment mode, staff/admin functions intentionally fail closed.

### P0: Student Lookup Could Expose Records by Guessable Case Number or Raw ID

Risk: student lookup supported email, raw backend IDs, and case numbers. Case numbers are useful for support but are guessable. Raw IDs should be staff-only. File links, teacher/class details, remarks, and activity context should not be exposed to someone who does not own the record.

Fix:

- Raw `submission_id` / `request_id` lookup is now staff-only.
- Student lookup results now pass through ownership checks.
- Matching signed-in owners can see full details.
- Non-owners only receive limited redacted status data.
- Submitted file links are hidden for limited lookup results.
- Raw backend IDs are stripped from non-operations student lookup responses.
- Case-number matching is now exact, not partial.
- Student view continues to use case number as the public reference and does not display backend submission ID.

Residual note:

- Older rows without `submitter_key` can still be shown as limited redacted rows if no active email is available. This preserves lookup continuity while avoiding file/teacher/remarks exposure.

### P0: Public Activity Endpoint Leaked Email-Based Submission Activity

Risk: `getSubmissionActivity(email)` could be called for an arbitrary email address and returned recent request counts and recent IDs.

Fix:

- The endpoint now requires a signed-in request identity.
- It returns activity only for operations users or the matching active email.
- Otherwise it returns an empty non-revealing response.

### P1: Teacher Queue Scope Could Be Widened by Client Filters

Risk: teacher view defaulted to "my students" but could be widened by client-side filters in some paths.

Fix:

- Teacher queue access is now always scoped server-side.
- Browser filters can narrow teacher results but cannot widen them.
- Special Request teacher/sponsor scoping is also enforced server-side.
- Teachers are read-only for workflow operations. They cannot call status-change endpoints, generate technician email drafts, or print operational labels.
- The teacher drawer now shows a read-only message instead of fake operational controls.

### P1: Admin Write Endpoints Needed Stronger Validation

Risk: admin save endpoints accepted client-supplied row indexes and object keys too directly.

Fix:

- Rule and user save endpoints now validate row indexes before writing.
- Unknown admin payload fields are rejected.
- Rule edits validate year group format, machine value, dimension numbers, file extensions, and boolean flags.
- User edits validate email format, role value, and active flag.
- Admin self-demotion/self-deactivation is blocked.
- At least one active admin path must remain through the Users sheet or configured admin override.

### P1: Public Issue Template Function Exposed Email Body Templates

Risk: `getIssueTemplatesForClient()` was callable as a public server function and returned full issue template rows, including email body template text.

Fix:

- Added an internal `getIssueTemplates_()` for server-side draft generation and status processing.
- `getIssueTemplatesForClient()` now requires admin access and returns only minimal client fields: issue code, issue label, and machine applicability.

### P1: Public Maintenance Functions Needed Guards

Risk: manual setup/maintenance functions can be callable from the browser if exposed as Apps Script server functions.

Fix:

- `bootstrap()` now requires system admin once storage has already been initialized.
- `preflight()` now requires system admin.
- `authorizeScopes()` now requires system admin once storage has already been initialized.
- `reseedIssueTemplates()` now requires system admin.

### P1: Upload Endpoint Needed Stronger Input Protection

Risk: file uploads accepted raw client payload fields and should not proceed without identity.

Fix:

- `uploadBase64File()` now requires a signed-in request identity.
- File name, MIME type, year group, and bucket are sanitized.
- Base64 size is checked before decoding.
- Decoded file size remains capped at 25 MB.

### P1: Email Payloads Needed Domain Control

Risk: if Apps Script cannot expose active-user email in a given deployment mode, a signed-in domain user could type an arbitrary external address into form payloads.

Fix:

- Added an approved school-domain allowlist in configuration.
- DT student email, Special Request requester email, teacher-in-charge email, approval email, and admin user email values are now checked against that allowlist.
- Admin/user setup can still be adjusted centrally by editing the allowlist if the school later needs additional trusted domains.

### P1: Clickjacking Surface

Risk: the app explicitly used `XFrameOptionsMode.ALLOWALL`, allowing any site to iframe the dashboard.

Fix:

- Changed to `HtmlService.XFrameOptionsMode.DEFAULT`.

### P2: Staff Drawer Link Escaping

Risk: one preview link in the staff drawer inserted the raw URL into an HTML attribute.

Fix:

- Escaped the preview link URL.
- Added `rel="noopener"` to staff drawer preview links.

### P2: Auto Email Personal Wording

Risk: generated email CC wording named a specific technician. Public/source-safe wording should be role-based.

Fix:

- Replaced named technician CC copy with generic `DT Technician`.

## Data Protection Controls Now In Code

- Admin-only and system-admin-only functions fail closed when the visitor is not recognized.
- Teacher view is scoped on the server.
- Student status lookup redacts non-owner results.
- File links are not returned in limited student lookup display.
- Raw backend IDs remain usable for staff/admin workflows, audit, and email drafts, but are not student-facing references.
- Case numbers remain the student-safe support reference.
- Public issue-template access is minimal and admin-gated.
- Uploads require request identity and sanitize storage folder inputs.
- Form and admin user emails are restricted to approved school domains.
- Browser link attributes are escaped.
- The dashboard uses default iframe protection.

## Deployment Checklist

Before pushing this to the real public dashboard:

1. Push to the test Apps Script deployment.
2. Confirm the deployment remains `DOMAIN` access, not anonymous public access.
3. Confirm staff/admin users still resolve correctly with active user email.
4. Confirm an unlisted domain user cannot access admin, users, rules, audit, or full queue data.
5. Confirm a teacher can only see their own linked DT submissions and Special Requests.
6. Confirm a student lookup by another student's case number shows limited status only, with no class, teacher, remarks, or file links.
7. Confirm a matching signed-in student can see their own case number, status, feedback, and submitted file links.
8. Confirm raw submission/request IDs work only for operations users.
9. Confirm upload still works for DT submissions and Special Requests.
10. Confirm generated emails include the case number and the system-auto-email footer.
11. Confirm the app is not iframeable from an unrelated external page.

## Remaining Gaps and Recommendations

- Add automated Apps Script integration checks for role scoping if the deployment environment supports test users.
- Consider replacing predictable row-based case numbers with a non-sequential short code for future submissions.
- Keep Drive file permissions limited to school accounts and the minimum staff group required.
- Keep the master spreadsheet shared only with trusted operations/admin users.
- Store any production-only IDs, emails, and deployment URLs outside public GitHub source before release.
- Add a formal `SECURITY.md` to the public GitHub repository with vulnerability reporting and privacy expectations.

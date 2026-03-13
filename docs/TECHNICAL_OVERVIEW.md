# Technical Overview — Design Fabrication Dashboard

Detailed code architecture and function map for the Design Fabrication Dashboard, a Google Apps Script web app with a single `code.gs` file.

---

## File Layout

The entire application is in `code.gs` (~4,960 lines). The file is organised into these major sections, in order:

| Lines (approx.) | Section | Description |
|-----------------|---------|-------------|
| 1–16 | `authorizeScopes()` | One-time OAuth scope trigger |
| 18–465 | `APP` constant | Configuration: sheet schemas, sample data, issue templates, status enum, UI text, teacher emails |
| 466–470 | Constants | `TECHNICIAN_ALLOWED_STATUSES`, `PREVIEW_IMAGE_EXTENSIONS` |
| 470–560 | Bootstrap & Setup | `bootstrap()`, `setup()`, `doGet()` |
| 560–860 | Server API Functions | Client-callable functions (`submitSubmission`, `submitOtherRequest`, `getStudentStatuses`, `getAdminRows`, `updateSubmissionStatus`, etc.) |
| 860–960 | Email Draft Generators | `generateEmailDraft()`, `generateTeacherUpdateDraft()` |
| 960–1000 | Spreadsheet URL helper | `getSpreadsheetUrl()`, `getAdminRows()` |
| 1000–1100 | Status Update & File Upload | `updateSubmissionStatus()`, `uploadBase64File()`, record lookups |
| 1100–1240 | Email Senders | `sendOtherRequestNotification_()`, `getStatusLabel_()` |
| 1240–1380 | Confirmation Emails | `sendSubmissionConfirmation_()`, `sendOtherRequestConfirmation_()`, teacher helpers |
| 1380–1530 | DT Status Notification | `sendStatusNotification_()` — the main needs-fix/completed/rejected emailer |
| 1530–1670 | Validation | `validateSubmission_()`, `validateOtherRequest_()`, dimension parsers |
| 1670–1830 | Utilities | Timestamps, file extensions, rule matching, sheet/folder helpers |
| 1830–1990 | Storage & Auth | Folder creation, sheet creation, seeding, user lookup, admin check |
| 1990–2070 | Admin CRUD | Rules, users, audit log, issue template management |
| 2070–2460 | `renderPage_()` | Main HTML renderer: CSS styles (~400 lines), HTML shell, BOOT object |
| 2460–3560 | Client JavaScript | All client-side logic: `init()`, page initialisers, form handlers, file upload, scroll behaviours |
| 3560–3600 | Disclaimer Helpers | `renderDisclaimerBox_()`, `renderCompactDisclaimer_()`, `renderWorkflowList_()`, `renderBulletList_()` |
| 3600–3830 | `renderSubmitPage_()` | DT submission form HTML |
| 3830–4160 | `renderOtherRequestPage_()` | Other Request form HTML (Sections A–G) |
| 4160–4210 | `renderStatusPage_()` | Status lookup page HTML |
| 4210–4280 | `renderAdminPage_()` | Admin dashboard HTML |
| 4280–4900 | `renderHelpPage_()` | Help page HTML (19 sections + ToC + quick-start hero) |
| 4900–4960 | Remaining Renderers | Rules, Users, Audit pages, `escapeHtml_()` |

---

## Function Map

### Setup & Entry Point

| Function | Callable By | Purpose |
|----------|------------|---------|
| `authorizeScopes()` | Script editor | Triggers OAuth prompts for Mail, Drive, Sheets |
| `bootstrap()` | Script editor | Creates Drive folders, spreadsheet, seeds all sheets |
| `setup()` | Script editor | Alias for `bootstrap()` |
| `doGet(e)` | Web request | Entry point — resolves user, determines page, renders HTML |

### Client-Callable Server Functions

These are called from the browser via `google.script.run`:

| Function | Purpose |
|----------|---------|
| `getRulesForClient()` | Returns all active rules as objects |
| `submitSubmission(payload)` | Validates and saves a DT submission |
| `submitOtherRequest(payload)` | Validates and saves an Other Request |
| `getStudentStatuses(query)` | Looks up DT submissions by email or ID |
| `getOtherRequestStatuses(query)` | Looks up Other Requests by email or ID |
| `getIssueTemplatesForClient()` | Returns all active issue templates |
| `generateEmailDraft(id, codes, remarks)` | Builds Needs Fix email HTML preview |
| `generateTeacherUpdateDraft(id, ...)` | Builds teacher notification preview |
| `getSpreadsheetUrl()` | Returns the master spreadsheet URL |
| `getAdminRows(filters)` | Returns filtered DT submission rows for admin |
| `getAdminOtherRequests(filters)` | Returns filtered Other Request rows for admin |
| `updateSubmissionStatus(id, status, issue, remarks)` | Updates DT submission status + sends emails |
| `updateOtherRequestStatus(id, status, remarks)` | Updates Other Request status + sends emails |
| `uploadBase64File(payload)` | Uploads a base64-encoded file to Drive |
| `getAdminRulesRows()` | Returns all rules for the admin Rules page |
| `saveAdminRule(rowIndex, data)` | Updates a rule row |
| `getAdminUsersRows()` | Returns all users for admin Users page |
| `saveAdminUser(rowIndex, data)` | Updates a user row |
| `addAdminUser(data)` | Adds a new user |
| `getAuditLogRows(limit)` | Returns recent audit log entries |
| `getAdminIssueRows()` | Returns all issue template rows |
| `reseedIssueTemplates()` | Overwrites issue templates with latest from code |

### Internal Server Functions (private, suffixed with `_`)

| Function | Purpose |
|----------|---------|
| `validateSubmission_(payload)` | Validates DT submission fields and dimensions |
| `validateOtherRequest_(payload)` | Validates Other Request fields |
| `sendStatusNotification_(id, status, issue, remarks)` | Sends DT status change emails (needs-fix uses CC) |
| `sendOtherRequestNotification_(id, status, remarks)` | Sends Other Request status change emails (needs-fix uses CC) |
| `sendSubmissionConfirmation_(record)` | Sends DT submission confirmation email |
| `sendOtherRequestConfirmation_(record)` | Sends Other Request confirmation email |
| `resolveTeacherEmail_(submission, name)` | Looks up teacher email from name |
| `isTeacherRecordMatch_(row, user)` | Checks if a submission belongs to a teacher's students |
| `getTeacherActionLine_(status)` | Returns suggested-action text for teacher emails |
| `getStatusLabel_(status)` | Converts status code to display label |
| `getSubmissionById_(id)` | Fetches a single DT submission |
| `getOtherRequestById_(id)` | Fetches a single Other Request |
| `getMatchingRule_(year, machine)` | Finds the active rule for a year+machine combo |
| `getCurrentUser_()` | Resolves the current user's email, role, and admin status |
| `requireAdmin_()` | Throws if current user is not an admin role |
| `getSheet_(name)` | Gets a sheet by name from the master spreadsheet |
| `getRowsAsObjects_(name)` | Reads sheet into array of {header: value} objects |
| `appendObject_(name, obj)` | Appends a row to a sheet from an object |
| `writeCellByHeader_(sheet, headers, row, header, value)` | Writes a single cell by column header |
| `getSpreadsheet_()` | Gets the master spreadsheet (cached via PropertiesService) |
| `getRootFolder_()` | Gets the root Drive folder |
| `getUploadFolder_(year, bucket)` | Gets the upload subfolder for a year+bucket |
| `getOrCreateFolder_(parent, name)` | Drive folder upsert |
| `ensureSheet_(ss, name, headers)` | Sheet upsert with header row |
| `seedRules_(sheet)` | Inserts default rules |
| `seedIssueTemplates_(sheet)` | Inserts all 44 issue templates |
| `seedUsers_(sheet)` | Inserts the script owner as admin |
| `escapeHtml_(str)` | HTML entity escaping |
| `getAuditTimestamp_()` | Current time formatted for audit log |
| `formatHongKongTimestamp_(value)` | Formats any date to HK timezone string |
| `toDateObject_(value)` | Parses various date formats to Date object |
| `getSortableTime_(value)` | Returns ISO string for sorting |
| `getFileExtension_(name)` | Extracts lowercase file extension |
| `parseRequiredDimension_(value, label)` | Validates a required number field |
| `parseOptionalDimension_(value, label)` | Validates an optional number field |

### Page Renderers (server-side HTML generators)

| Function | Returns |
|----------|---------|
| `renderPage_(page, boot)` | Full HTML document — CSS, HTML shell, client JS |
| `renderSubmitPage_()` | DT submission form with path selector |
| `renderOtherRequestPage_()` | Other Request form (Sections A–G) |
| `renderStatusPage_(user)` | Status lookup page |
| `renderAdminPage_(user)` | Admin dashboard |
| `renderHelpPage_()` | Help page (19 sections + ToC + quick-start) |
| `renderRulesPage_()` | Rules admin page |
| `renderUsersPage_()` | Users admin page |
| `renderAuditPage_()` | Audit log admin page |
| `renderDisclaimerBox_(title, body, variant)` | Reusable disclaimer card HTML |
| `renderCompactDisclaimer_(text)` | Compact inline disclaimer |
| `renderWorkflowList_(steps)` | Numbered workflow step list |
| `renderBulletList_(items)` | HTML bullet list from array |

### Client-Side JavaScript Functions

These run in the browser. Key functions:

| Function | Purpose |
|----------|---------|
| `init()` | Attaches nav handlers, initialises the default page |
| `switchPage(name)` | Switches visible page, lazy-initialises if first visit |
| `initSubmitPage()` | Sets up DT form: rules fetching, dimension validation, file zones, checklist |
| `initOtherPage()` | Sets up Other Request form: conditional fields, teacher email lookup |
| `initStatusPage()` | Sets up status search, auto-loads for students |
| `initAdminPage()` | Sets up admin filters, row loading, drawer, email modal |
| `loadStatuses()` | Fetches and renders status results from dual sources |
| `loadAdminRows()` | Fetches and renders admin table rows from dual sources |
| `openDrawer(data)` | Opens the review drawer for a submission |
| `saveFromDrawer()` | Saves status update from the drawer |
| `showEmailModal()` | Shows email draft preview |
| `uploadFileInput_(input, zone, callback)` | Handles file upload with 25 MB guard |
| `setupFileZone_(zoneId, inputId, ...)` | Wires up drag-and-drop file zone |
| `showToast(msg, type)` | Shows a toast notification |
| `helpJump_(id)` | Expands and scrolls to a help section |

---

## How Rendering Works

1. `doGet()` is called on every page load
2. It calls `getCurrentUser_()` to resolve the user's role
3. It calls `renderPage_(page, boot)` which:
   - Outputs the full `<html>` document as a string
   - Embeds all CSS in a `<style>` block
   - Calls each `render*Page_()` function to generate page content
   - Embeds the `BOOT` object (serialised user/role/rules data) as a `<script>` variable
   - Embeds all client JavaScript in a `<script>` block
4. The client JS runs `init()` on DOM ready, which initialises the visible page

**All pages are pre-rendered server-side** and toggled via `display: none/block` on the client. This means page switches are instant (no server round-trip) but the initial load includes all page HTML.

---

## How Persistence Works

```
Client JS
  │
  ├─ google.script.run.submitSubmission(payload)
  │     └─ validateSubmission_(payload)
  │     └─ appendObject_('Submissions', record)
  │     └─ sendSubmissionConfirmation_(record)
  │
  ├─ google.script.run.updateSubmissionStatus(id, status, issue, remarks)
  │     └─ writeCellByHeader_(...) for each field
  │     └─ appendObject_('AuditLog', entry)
  │     └─ sendStatusNotification_(...)
  │
  └─ google.script.run.uploadBase64File(payload)
        └─ Utilities.base64Decode → blob → Drive folder
```

All reads use `getRowsAsObjects_(sheetName)` which reads the entire sheet and converts to an array of objects keyed by header names.

---

## How Emails Work

```
Status change detected
  │
  ├─ newStatus === 'needs_fix'?
  │     YES → Single email
  │            To: student
  │            CC: teacher + APP.technicianCcEmail
  │            ReplyTo: active user (sender)
  │            Body: issue template instructions + remarks
  │
  │     NO → Separate emails
  │           → Student gets status update
  │           → Teacher gets notification (for completed/rejected)
  │
  └─ Audit log entry created
```

---

## Sensitive Areas (Regression Risk)

These areas are the most sensitive and should be edited carefully:

1. **`APP` constant (lines 18–465)** — Sheet schemas, issue templates, and UI text. Changing headers here without updating the actual sheet will break reads/writes.

2. **`validateSubmission_()` and `validateOtherRequest_()`** — These gate all submissions. Broken validation = broken submissions or invalid data.

3. **`sendStatusNotification_()` and `sendOtherRequestNotification_()`** — These send emails to students and teachers. Errors here can cause silent email failures or spam.

4. **`doGet()` and `renderPage_()`** — These generate the entire HTML. A syntax error in the template literal kills the whole app.

5. **`initSubmitPage()` and `initOtherPage()`** — These wire up all form interactions. Breaking these makes forms non-functional with no visible error.

6. **Status constants (`APP.status`)** — These are used everywhere. Renaming a status without updating all references will break filtering, emails, and UI.

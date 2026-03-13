# Design Fabrication Dashboard

A role-based Google Apps Script dashboard for managing school laser cutting and 3D printing requests, with separate workflows for DT coursework and non-DT / special project submissions.

## Project Summary

Design Fabrication Dashboard is a school fabrication request management system built with Google Apps Script. It supports the full workflow from submission to review, queueing, production, and collection. The app is primarily designed for DT student coursework submissions, while also supporting a clearly separated approval-based workflow for other subject projects, competitions, exhibitions, clubs, and special fabrication requests. It uses Google Sheets for structured records, Google Drive for file storage, and MailApp for workflow notifications.

## Project Metadata

| | |
|---|---|
| **Project Name** | Design Fabrication Dashboard |
| **Repository Name** | design-fabrication-dashboard |
| **Platform** | Google Apps Script Web App |
| **Main File** | `code.gs` (single-file architecture) |
| **Storage** | Google Sheets (6 sheets) + Google Drive (file uploads) |
| **Notifications** | MailApp email notifications |
| **Primary Users** | Students, teachers, technicians, admins |
| **Core Purpose** | Manage DT coursework submissions and separate non-DT fabrication requests |

## Status

This is an actively developed internal school workflow tool built for the VSA Design & Technology Department. It is deployed as a Google Apps Script web app and used in production for managing DT workshop fabrication requests.

This public repository is a sanitized showcase version. Placeholder values are used instead of live staff contacts, deployment URLs, spreadsheet IDs, and folder IDs. It is intended for reference, demonstration, documentation, and handover support.

## Repository Contents

| File | Description |
|---|---|
| `code.gs` | Entire application — server functions, HTML, CSS, and client JavaScript |
| `README.md` | Project documentation (this file) |
| `CHANGELOG.md` | Version history and release notes |
| `GITHUB_PUBLISHING.md` | Instructions for publishing to GitHub |
| `docs/TECHNICAL_OVERVIEW.md` | Code architecture, function map, and regression-sensitive areas |
| `docs/HANDOVER.md` | Maintenance guide, common tasks, troubleshooting, and testing approach |
| `docs/assets/screenshots/` | Screenshot placeholders and naming guidance |
| `docs/assets/diagrams/` | Diagram placeholders and documentation assets |
| `.gitignore` | Git ignore rules for macOS, editors, and Apps Script tooling |

## Table of Contents

- [Project Summary](#project-summary)
- [Project Metadata](#project-metadata)
- [Status](#status)
- [Repository Contents](#repository-contents)
- [Who Is This For?](#who-is-this-for)
- [Main Workflows](#main-workflows)
- [Current Scope](#current-scope)
- [What This Repo Is Not](#what-this-repo-is-not)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Roles & Permissions](#roles--permissions)
- [Submission Workflows](#submission-workflows)
- [Email Behaviour](#email-behaviour)
- [Setup & Deployment](#setup--deployment)
- [Maintenance Guide](#maintenance-guide)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)
- [License](#license)

## Who Is This For?

| Role | Description |
|---|---|
| **DT Students** | Submit laser/3D files, track status, fix issues when flagged |
| **Non-DT Students / Clubs** | Submit Special Requests with responsible teacher / staff approval |
| **Teachers** | Receive notifications about student submissions, help with "Needs Fix" issues |
| **Technicians** | Review submissions, update statuses, send feedback via issue templates |
| **Admins** | Full access to all submissions, user management, rules, audit logs |

## Main Workflows

The system handles two distinct submission pathways:

| Pathway | Who Uses It | Purpose |
|---|---|---|
| **DT Student Project** | DT students (Y8–Y10) | Regular coursework — laser cutting or 3D printing homework/projects |
| **Special Request** | Any department, club, or competition team | Non-DT fabrication needs requiring responsible teacher / staff approval |

These are intentionally kept separate because DT coursework may be prioritised, non-DT requests require additional approval fields, and the review workflows differ.

Both pathways follow a **7-stage status progression**: `Submitted` → `Needs Fix` → `Approved` → `In Queue` → `In Production` → `Completed` → `Rejected`.

## Current Scope

The current implementation includes:

- **DT coursework submission path** — year-group-based rules, dimension validation, file uploads
- **Special Request path** — extended form (Sections A–G) with responsible teacher / staff approval required
- **Role-aware navigation** — students see 3 tabs, teachers/technicians see 4, admins see 8
- **Status checking** — dual-source lookup merging DT Submissions and Special Requests
- **Review and admin workflows** — admin dashboard with filtering, review drawer, issue code selection
- **Email notifications** — Needs Fix single-threaded CC emails, confirmation emails, status change alerts
- **Help and beginner guidance** — multi-section help page with accordion, quick-start hero, category badges
- **Separate data structure for non-DT requests** — dedicated OtherRequests sheet with approval fields
- **Machine overview content** — cards with specifications for laser cutters and 3D printers
- **Turnaround and priority disclaimers** — DT coursework may be prioritised; submission does not mean same-day production

## What This Repo Is Not

- **Not a generic manufacturing platform.** This is purpose-built for a school DT workshop managing laser cutting and 3D printing submissions.
- **Not a public SaaS product.** It is an internal tool deployed within a specific school's Google Workspace.
- **Not a fully modular multi-file GAS codebase (yet).** The entire application lives in a single `code.gs` file for simplicity of deployment. Future work could split it into multiple files if needed.
- **Not a design tool.** Students prepare their files externally (e.g. in Adobe Illustrator, Fusion 360) and upload them via this dashboard.
- **Not a full school MIS or student information system.**
- **Not a full CAD/CAM pipeline.**

## Key Features

### Submission System

- Dual-path submission: DT Student Project vs Special Request
- Dynamic form rules based on year group and machine type
- Real-time dimension validation against configured size limits
- File upload to Google Drive with client-side size guard
- Submission checklist with live progress bar
- Confirmation emails on successful submission

### Review & Production Tracking

- 7-stage status workflow: `Submitted` → `Needs Fix` → `Approved` → `In Queue` → `In Production` → `Completed` → `Rejected`
- Admin/technician review drawer with status updates, issue codes, and remarks
- Dual-source status lookup (DT + Special Requests merged)
- Timeline view showing status history
- Role-based admin views (technician sees production queue, teacher sees "my students")

### Email Notifications

- Automatic emails on every status change
- **Needs Fix:** single-threaded email to student with CC to teacher + a configured technician mailbox, with Reply-To set to the sender — all parties stay on one thread for follow-up
- Pre-built issue templates with detailed HTML fix instructions (laser, 3D print, and general categories)
- Teacher notification emails for Completed and Rejected statuses
- Confirmation emails for both DT and Special Request submissions

### Help & Guidance

- Multi-section help page with collapsible accordion
- "New Here?" quick-start hero guide for first-time users
- Category badges (Everyone / DT Students / Non-DT) on each section
- Table of Contents with auto-expand on click
- Machine overview cards with specifications
- Beginner file preparation guides for laser and 3D
- Interactive submission checklist
- Quick Reference key rules

### UI/UX

- Student-centred design with clear guidance for non-DT newcomers
- Welcome banner on Submit page with feature pills
- Path selector cards with "Who is this for?" bullet lists
- Newcomer info strip on Special Request page
- Visual step guide on Status page empty state
- Scroll-to-top button, mobile scroll fade indicators
- Professional branded footer
- Role-aware navigation (students see 3 tabs; admins see 8)
- Toast notifications, loading states, debounced inputs

### Administration

- Filter bar with status, year group, machine, and free-text search
- "My students only" toggle for teachers
- Dual-source admin view (DT Submissions + Special Requests)
- Rules management page
- User management page
- Audit log with timestamped entries
- Direct link to master spreadsheet

## System Architecture

```
┌─────────────────────────────────┐
│   Google Apps Script Web App    │
│         (code.gs)               │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │ Server-   │  │ Client-    │  │
│  │ side GAS  │  │ side JS    │  │
│  │ functions │  │ + HTML/CSS │  │
│  └─────┬─────┘  └─────┬──────┘  │
│        │              │         │
│  ┌─────▼──────────────▼──────┐  │
│  │  google.script.run        │  │
│  │  (async RPC bridge)       │  │
│  └───────────┬───────────────┘  │
└──────────────┼──────────────────┘
               │
    ┌──────────▼──────────┐
    │   Google Sheets     │
    │   (6 sheets)        │
    ├─────────────────────┤
    │   Google Drive      │
    │   (file uploads)    │
    ├─────────────────────┤
    │   MailApp           │
    │   (notifications)   │
    └─────────────────────┘
```

**Single-file Google Apps Script architecture:** The entire Design Fabrication Dashboard — server functions, HTML, CSS, and client JavaScript — lives in one `code.gs` file. This is intentional for simplicity of deployment in Google Apps Script. The `doGet()` function renders the full page server-side via template literal functions.

For a fuller architecture explanation, see [docs/TECHNICAL_OVERVIEW.md](docs/TECHNICAL_OVERVIEW.md).

## Data Model

The app uses 6 Google Sheets as its database:

### Submissions

Stores DT student coursework submissions.

| Column | Description |
|---|---|
| `submission_id` | Unique ID (e.g. DT-20260309-XXXX) |
| `created_at` | ISO timestamp |
| `student_email` | Student's school email |
| `student_name` | Full name |
| `design_class_no` | Class number (e.g. "8.1") |
| `design_teacher` | Teacher name |
| `year_group` | Y8, Y9, Y10, etc. |
| `machine` | laser or 3d |
| `material` | Selected material |
| `width`, `height`, `depth` | Design dimensions |
| `units` | cm or mm |
| `working_file_id/name/url` | Google Drive file reference |
| `preview_file_id/name/url` | Preview image reference |
| `status` | Current workflow status |
| `issue_code` | Comma-separated issue template codes |
| `admin_remarks` | Technician notes |
| `submitted_by`, `updated_at`, `updated_by` | Audit fields |

### OtherRequests

Stores non-DT / special fabrication requests.

| Column | Description |
|---|---|
| `request_id` | Unique ID (e.g. OR-20260309-XXXX) |
| `requester_email/name/role` | Who is requesting |
| `department_or_subject` | Science, Art, Club, etc. |
| `request_type` | Competition, exhibition, event, etc. |
| `project_name/purpose` | What and why |
| `competition_name`, `event_or_deadline` | Optional context |
| `teacher_in_charge/email` | Responsible teacher |
| `approved_by_email`, `approval_status` | Approval tracking |
| `machine`, `material`, `dimensions` | Fabrication details |
| `quantity` | Number of copies |
| `needed_by_date`, `priority_reason` | Scheduling context |
| `request_description` | Free-text description |
| `status`, `issue_code`, `admin_remarks` | Review fields |

### Rules

Configures what each year group can submit.

| Column | Description |
|---|---|
| `year_group` | Y8, Y9, Y10, etc. |
| `machine` | laser or 3d |
| `max_width/height/depth` | Size limits |
| `units` | cm or mm |
| `materials` | Comma-separated list of available materials |
| `accepted_extensions` | Allowed file types |
| `preview_required` | TRUE/FALSE |
| `notes` | Display notes for the form |
| `active` | Enable/disable rule |

### IssueTemplates

Pre-built feedback messages for common submission problems.

| Column | Description |
|---|---|
| `issue_code` | Unique code (e.g. LC_FILETYPE_WRONG) |
| `issue_label` | Human-readable label |
| `applies_to` | laser, 3d, or blank (general) |
| `email_subject` | Email subject line |
| `email_body_html` | Detailed HTML instructions |
| `active` | Enable/disable |
| `sort_order` | Display order |

### Users

Role assignments for access control.

| Column | Description |
|---|---|
| `email` | Google account email |
| `name` | Display name |
| `role` | admin, teacher, technician, or blank (student/guest) |
| `active` | Enable/disable |

### AuditLog

Timestamped log of all actions.

| Column | Description |
|---|---|
| `timestamp` | Timestamp string |
| `submission_id` | Related submission or request ID |
| `actor_email` | Who performed the action |
| `action_type` | update_status, auto_email_sent, etc. |
| `old_status`, `new_status` | Status transition |
| `notes` | Additional context |

## Roles & Permissions

| Action | Student | Teacher | Technician | Admin |
|---|---|---|---|---|
| Submit DT Project | ✅ | ✅ | ✅ | ✅ |
| Submit Special Request | ✅ | ✅ | ✅ | ✅ |
| Check own status | ✅ | ✅ | ✅ | ✅ |
| View Admin panel | ❌ | ✅ | ✅ | ✅ |
| Update submission status | ❌ | ❌ | ✅* | ✅ |
| Send Needs Fix emails | ❌ | ❌ | ✅ | ✅ |
| Manage Rules | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| View Audit Log | ❌ | ❌ | ❌ | ✅ |

\* Technicians can only set statuses: Approved, In Queue, In Production, Completed (not Needs Fix, Submitted, or Rejected).

**Navigation tabs visible:**

- **Student/Guest:** Submit, Status, Help
- **Teacher/Technician:** Submit, Status, Admin, Help
- **Admin:** Submit, Status, Admin, Help, Rules, Users, Audit

## Submission Workflows

### DT Student Project Flow

```
Student fills form → Upload file → Submit
        │
        ▼
   [Submitted] ──── technician reviews ────┐
        │                                   │
        ▼                                   ▼
   [Approved]                         [Needs Fix]
        │                              (email sent to student,
        ▼                               CC: teacher + technician)
   [In Queue]                               │
        │                         student fixes & resubmits
        ▼                                   │
  [In Production]                           ▼
        │                            [Submitted] again
        ▼
   [Completed]
  (email sent, collect from workshop)
```

### Special Request / Non-DT Flow

```
Requester fills detailed form (Sections A–G)
  │  Includes: teacher sponsor, purpose, deadline
  │
  ▼
[Submitted] ──── technician reviews ────┐
  │                                      │
  ▼                                      ▼
[Approved]                          [Needs Fix]
  │                                 (single-thread email,
  ▼                                  CC: teacher + technician)
[In Queue]
  │
  ▼
[In Production]
  │
  ▼
[Completed]
```

**Key difference:** Special Requests require a responsible teacher, have additional fields (purpose, deadline, competition name, quantity), and DT coursework may be prioritised when the queue is full.

### Combined Review Queue Flow

```
┌──────────────────┐     ┌──────────────────┐
│  DT Student      │     │  Special Request  │
│  Submissions     │     │  Submissions      │
└────────┬─────────┘     └────────┬──────────┘
         │                        │
         └───────────┬────────────┘
                     ▼
         ┌───────────────────────┐
         │   Reviewer Queue      │
         │   (merged view)       │
         │                       │
         │  • Filter by source   │
         │  • Filter by status   │
         │  • Filter by year     │
         │  • Filter by machine  │
         │  • Free-text search   │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Review Drawer       │
         │                       │
         │  • View details       │
         │  • Update status      │
         │  • Select issue codes │
         │  • Add remarks        │
         │  • Trigger emails     │
         └───────────────────────┘
```

## Email Behaviour

### Needs Fix (single-threaded)

When a submission is marked "Needs Fix":

- **To:** Student / Requester
- **CC:** Teacher + configured technician mailbox
- **Reply-To:** The technician who marked it
- All parties receive one email and can Reply All to follow up

The email includes the full issue template instructions with step-by-step fix guides.

### Completed / Rejected

- Separate emails sent to student and teacher
- Student gets collection instructions or rejection reason
- Teacher gets action guidance

### Confirmation Emails

- Sent immediately on successful DT submission or Special Request submission
- Contains submission ID, summary of what was submitted, and next-step instructions

### CC Configuration

The technician CC email is configured at the top of `code.gs`:

```javascript
technicianCcEmail: 'dt-technician@example.edu'
```

## Setup & Deployment

### Prerequisites

- A Google account with access to Google Drive, Sheets, and Apps Script
- The account must be able to send emails via Gmail

### Step 1: Create the Apps Script Project

1. Go to [script.google.com](https://script.google.com/)
2. Click **New Project**
3. Delete the default `Code.gs` content
4. Paste the entire contents of `code.gs` from this repo

### Step 2: Authorise Scopes

1. In the Apps Script editor, select `authorizeScopes` from the function dropdown
2. Click **Run**
3. Accept the Google authorization prompt (Drive, Sheets, Mail scopes)

### Step 3: Bootstrap the System

1. Select `bootstrap` from the function dropdown
2. Click **Run**
3. This creates:
   - A "Design Fabrication Dashboard" root folder in Google Drive
   - Year-group upload subfolders (`workingFiles/`, `previews/`)
   - A master Google Spreadsheet with all 6 sheets
   - Default rules for Y8, Y9, Y10
   - Issue templates
   - A default admin user (the script owner)
4. Check the Execution Log for the setup summary including folder and spreadsheet URLs

### Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Set:
   - Execute as: **Me** (your account)
   - Who has access: **Anyone within your organisation** (or Anyone, depending on your needs)
4. Click **Deploy**
5. Copy the web app URL — this is the dashboard link to share

### Step 5: Configure Users

1. Open the master spreadsheet (URL shown in bootstrap log)
2. Go to the **Users** sheet
3. Add rows for teachers, technicians, and admins:
   - `email`: their Google account email
   - `name`: display name
   - `role`: `admin`, `teacher`, or `technician`
   - `active`: `TRUE`

### Step 6: Configure Rules (Optional)

- The Rules sheet is pre-seeded with Y8/Y9/Y10 defaults
- Edit directly in the sheet or via the Rules admin page in the dashboard
- Each row defines: year group, machine, size limits, materials, accepted file types

### Step 7: Verify

1. Open the web app URL in a browser
2. You should see the Submit page with the DT/Special Request path selector
3. Test the Help page — all sections should be collapsible
4. If you are the admin, you should see all navigation tabs (up to 8)

## Maintenance Guide

### Common Tasks

| Task | How |
|---|---|
| Add a new year group | Add row(s) to the Rules sheet with the year, machine, limits, and materials |
| Update materials list | Edit the `materials` column in Rules (comma-separated) |
| Add a new teacher | Add to `APP.teacherEmails` in `code.gs` AND to the Users sheet |
| Add a user role | Add row to Users sheet: email, name, role, TRUE |
| Reseed issue templates | Run `reseedIssueTemplates()` from the script editor (overwrites existing) |
| Check audit log | Use the Audit tab in the dashboard (admin only) or open the AuditLog sheet |
| Change technician CC | Edit `APP.technicianCcEmail` at the top of `code.gs` |
| Update turnaround messaging | Edit the `APP.uiText` object in `code.gs` |

### After Code Changes

1. Save the file in the Apps Script editor
2. Click **Deploy → Manage deployments**
3. Edit the existing deployment and click **Deploy** to publish changes
4. Hard-refresh the web app in your browser (Cmd+Shift+R)

### Teacher Email Mapping

Teacher names → emails are hardcoded in `APP.teacherEmails`. The public repo uses placeholders. Replace them with your real school staff list before deployment:

```javascript
teacherEmails: {
  'Teacher A': 'teacher.a@example.edu',
  'Teacher B': 'teacher.b@example.edu',
  // ... add new entries here
}
```

Also update the `<select>` dropdown in `renderSubmitPage_()` if adding a new teacher to the DT form.

## Project Structure

```
├── code.gs                          # Entire application (server + client)
├── README.md                        # This file
├── CHANGELOG.md                     # Version history
├── GITHUB_PUBLISHING.md             # Public repo preparation checklist
├── LICENSE                          # MIT License
├── .gitignore                       # Git ignore rules
└── docs/
    ├── TECHNICAL_OVERVIEW.md        # Code architecture & function map
    ├── HANDOVER.md                  # Handover guide for future developers
    └── assets/
        ├── screenshots/             # Screenshot placeholders
        └── diagrams/                # Diagram placeholders
```

**Why a single file?** Google Apps Script web apps that use `HtmlService.createHtmlOutput()` with inline HTML work best as a single file. Splitting into separate `.html` files would require switching to `HtmlService.createTemplateFromFile()` and managing includes — added complexity with no real benefit for this project size. The single-file approach means you can paste the entire app into any GAS project and it works immediately.

## Known Limitations

- **Single-file size:** The file is large but still well within GAS limits. Future maintainers should use search (Ctrl+F) and the function list in the script editor.
- **No offline support:** Requires internet and Google account authentication.
- **Google daily email quota:** MailApp has a daily sending limit (100 for free accounts, 1,500 for Workspace). High-volume periods may hit this limit.
- **No file versioning:** Resubmissions create new entries rather than updating existing ones.
- **Teacher list is hardcoded:** Adding/removing teachers requires a code edit (not sheet-only).
- **No real-time updates:** Status page requires manual refresh or re-search; no WebSocket/push.
- **Sheet-based storage:** Google Sheets is not a real database — concurrent writes from many users could theoretically cause conflicts, though this is unlikely at school scale.
- **No automated test suite:** Testing is manual; no structured QA routines exist in this repository.
- **Public demo assets not yet included:** Production screenshots are not committed.

## License

This project is released under the [MIT License](LICENSE).

Developed by the VSA Design & Technology Department as a school fabrication workflow tool. This public repository is a showcase version prepared for reference, collaboration, and departmental documentation.




can you update this readme to be like https://github.com/sunnydesigntech/design-fabrication-dashboard, that with flow chart and all well explained

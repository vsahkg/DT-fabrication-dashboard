# Design Fabrication Dashboard

A Google Apps Script fabrication workflow dashboard for managing DT coursework submissions and non-DT special requests across laser cutting and 3D printing.

## Project Summary

Design Fabrication Dashboard is a single-file Google Apps Script web app used to run a school workshop submission pipeline end to end:

- student and staff submission
- file and dimension validation
- reviewer queue operations
- status tracking
- email notifications
- rule and user administration

The current implementation separates two pathways on purpose:

- **DT Submit** for normal DT coursework
- **Special Request** for competitions, clubs, exhibitions, other subjects, and sponsored non-DT work

That separation matters because DT coursework can be prioritised differently, Special Requests capture extra approval context, and reviewer decisions may follow slightly different communication patterns.

## Project Metadata

| | |
|---|---|
| **Project Name** | Design Fabrication Dashboard |
| **Repository Name** | design-fabrication-dashboard |
| **Platform** | Google Apps Script Web App |
| **Main File** | `code.gs` |
| **Architecture** | Single-file GAS app with inline server logic, HTML, CSS, and client JavaScript |
| **Storage** | Google Sheets (7 logical sheets) + Google Drive |
| **Notifications** | MailApp automatic and reviewer-composed emails |
| **Primary Users** | Students, teachers, technicians, admins |
| **Core Purpose** | Manage fabrication requests from submission through review, queueing, production, and collection |

## Current Snapshot

The current `code.gs` snapshot is a public-safe sync of the latest Apps Script dashboard release. It includes:

- DT coursework submission with prototype type selection (`low`, `hi`, `na`)
- Special Request submission with sponsor / teacher approval fields
- sheet-backed submission deadline and cutoff controls by year group or class
- merged reviewer queue across DT and Special Request records
- default Admin queue ordering by latest spreadsheet row, so newly appended submissions appear first
- full-row status colouring for faster queue scanning, including green completed rows and distinct active / needs-fix / rejected states
- rule-based year dropdowns across Admin filters, Special Request student details, and submission cutoff controls
- client-side quick search, focus-lane, and sort re-rendering after the main queue data loads, reducing repeated Apps Script roundtrips
- explicit Admin Refresh actions that bypass the local cache and reload the backing spreadsheet
- richer student Status Lookup cards with current step, next action, next checkpoint, submitted files, and machine-specific checklists
- repeat-submission and last-24-hour activity signals for reviewers and submitters
- manual email draft generation for students and teachers
- machine guide content with workshop-specific guidance and manufacturer-verified specs
- rules, users, submission controls, and audit views for admins

This repository should be treated as a documentation-oriented working copy of the project. The published `code.gs` intentionally uses neutral `example.edu` contacts, generic teacher labels, and blank deployment metadata. Before deploying it to a school environment, configure contacts, script properties, and deployment settings locally.

## Repository Contents

| File | Description |
|---|---|
| `code.gs` | Entire application: config, server functions, page renderers, CSS, and client JS |
| `README.md` | Project overview, workflows, setup, and operations guide |
| `CHANGELOG.md` | Public-facing release notes for this repository |
| `GITHUB_PUBLISHING.md` | GitHub publication and sanitisation checklist |
| `docs/TECHNICAL_OVERVIEW.md` | Architecture and function-group overview |
| `docs/HANDOVER.md` | Maintenance, setup, QA, and operational notes |
| `docs/assets/screenshots/` | Screenshot placeholders and naming guidance |
| `docs/assets/diagrams/` | Diagram placeholders and asset notes |

## Who This Is For

| Role | What They Use It For |
|---|---|
| **DT students** | Submit coursework jobs, track status, respond to review feedback |
| **Non-DT students / clubs / departments** | Submit Special Requests with sponsor approval |
| **Teachers** | Monitor student progress, receive updates, support fixes |
| **Technicians** | Operate the queue, review jobs, update statuses, communicate issues |
| **Admins** | Full operational access including rules, users, submission controls, and audit log |

## Main Workflows

### 1. DT Coursework Submission

Used for normal DT student work.

- captures student details, class, teacher, year group, machine, material, dimensions, prototype type, and files
- validates the upload against configured rule rows in the `Rules` sheet
- checks whether a submission window is open using the `SubmissionControls` sheet
- writes the submission to `Submissions`
- sends a confirmation email and records activity in `AuditLog`

### 2. Special Request Submission

Used for non-DT fabrication needs.

- captures requester identity, role, department, project purpose, teacher sponsor, approver, fabrication details, dates, and files
- writes the request to `OtherRequests`
- sends confirmation email to the requester and notification email to the teacher in charge
- appears in the same reviewer queue as DT submissions, but keeps source-specific fields intact

### 3. Reviewer Queue and Status Workflow

Both pathways share the same 7-stage workflow:

`Submitted -> Needs Fix -> Approved -> In Queue -> In Production -> Completed -> Rejected`

Technicians are intentionally restricted to production-side statuses only:

- `approved`
- `in_queue`
- `in_production`
- `completed`

Admins retain full workflow control.

## Feature Overview

### Submission System

- DT and Special Request pathways are rendered as separate pages
- live rule-based validation for year group, machine, materials, dimensions, and file extensions
- preview image validation for accepted image types
- one-working-file-per-submission guidance in both pathways
- prototype type field for DT coursework submissions
- duplicate / recent-activity reminders based on same-day and last-24-hour submission activity
- submission cutoffs and deadlines configurable per year group or class

### Reviewer Operations

- merged queue view for DT and Special Request records
- filters by source, year, machine, status, teacher, class, and student email
- year filters are generated from the active `Rules` sheet instead of fixed to a hard-coded range
- default sort by latest spreadsheet row so manual spreadsheet additions are visible at the top of the queue
- optional priority and timestamp sorts for review-focused workflows
- full-row status colours for completed, rejected, needs-fix, submitted, approved, queued, and in-production work
- client-side quick search, sort, and focus-lane rendering for smoother use with larger queues
- explicit Refresh buttons that force a fresh spreadsheet read when staff need to verify newly-added rows
- teacher-scoped queue view with “My students only” default
- review drawer with record context, activity history, remarks, and status actions
- audit log entries for status changes, manual email sends, rule edits, and cutoff actions

### Email Behaviour

- automatic confirmation emails for both submission pathways
- automatic status emails on status changes
- threaded `Needs Fix` email model with CC for teacher + technician mailbox
- manual student review draft generation from issue templates
- manual teacher update draft generation based on current status and remarks
- send-anyway reviewer compose flow with `sendComposedEmail()` and audit logging

### Administration

- rules page for fabrication policies
- submission control page for deadline / cutoff management
- user management page
- audit log page
- direct open-link to the backing spreadsheet
- system-admin-only access for rules, users, audit, and direct spreadsheet opening

### Guidance Content

- Machines page with school limits, machine context, process guides, and report-writing prompts
- Help page with beginner guidance, common mistakes, quick-start content, and turnaround messaging
- role-adaptive navigation and page labels

## System Architecture

```text
┌──────────────────────────────────────────────┐
│ Google Apps Script Web App                  │
│ code.gs                                     │
│                                              │
│  Config + Seed Data                         │
│  Server Functions                           │
│  HTML Renderers                             │
│  Inline CSS + Client JS                     │
└──────────────────────┬───────────────────────┘
           │ google.script.run
┌──────────────────────▼───────────────────────┐
│ Google Sheets                                │
│ - Submissions                                │
│ - Rules                                      │
│ - SubmissionControls                         │
│ - IssueTemplates                             │
│ - Users                                      │
│ - AuditLog                                   │
│ - OtherRequests                              │
└───────────────┬──────────────────────────────┘
    │
     ┌──────────▼──────────┐    ┌────────────────┐
     │ Google Drive        │    │ MailApp        │
     │ file uploads        │    │ notifications  │
     └─────────────────────┘    └────────────────┘
```

The application stays in one Apps Script file on purpose. That keeps deployment simple inside GAS, but it also means UI template strings, client JS, and server logic are tightly coupled and should be edited carefully.

## Data Model

The current system uses **7 logical sheets**.

### Submissions

DT coursework records.

Important fields:

- `submission_id`
- `created_at`
- `student_email`
- `student_name`
- `design_class_no`
- `design_teacher`
- `year_group`
- `machine`
- `material`
- `width`, `height`, `depth`, `units`
- `working_file_*`
- `preview_file_*`
- `status`
- `issue_code`
- `admin_remarks`
- `submitted_by`, `updated_at`, `updated_by`
- `prototype_fidelity`

### OtherRequests

Special Request records.

Important fields:

- requester identity and role
- department / subject
- request type
- project purpose and context
- teacher-in-charge and approver details
- fabrication details, dimensions, quantity, dates
- working and preview file references
- workflow status and reviewer remarks

### Rules

Validation rules by year group and machine.

Important fields:

- `year_group`
- `machine`
- `max_width`, `max_height`, `max_depth`
- `units`
- `materials`
- `accepted_extensions`
- `preview_required`
- `notes`
- `active`

### SubmissionControls

Sheet-backed submission opening / closing rules.

Important fields:

- `control_id`
- `year_group`
- `class_no`
- `deadline_at`
- `is_closed`
- `message`
- `active`
- `updated_at`
- `updated_by`

These rows are checked during `submitSubmission()` so DT submissions can be blocked or warned based on year or class scope.

### IssueTemplates

Reusable HTML issue instructions for `Needs Fix` and draft generation.

### Users

Role assignments and active flags.

### AuditLog

Timestamped activity ledger for workflow and admin actions.

## Roles and Navigation

### Permissions

| Action | Student | Teacher | Technician | Admin |
|---|---|---|---|---|
| Submit DT work | Yes | Yes | Yes | Yes |
| Submit Special Request | Yes | Yes | Yes | Yes |
| Check status | Yes | Yes | Yes | Yes |
| View merged queue | No | Yes | Yes | Yes |
| Update statuses | No | No | Limited | Yes |
| Send manual draft emails | No | No | Yes | Yes |
| Edit rules | No | No | No | Yes |
| Edit submission controls | No | No | No | Yes |
| Edit users | No | No | No | Yes |
| View audit log | No | No | No | Yes |

### Role-Adaptive Navigation

| Role | Tabs |
|---|---|
| **Student / guest** | DT Submit, My Status, Machines, Special Request, Help |
| **Teacher** | DT Submit, Student Status, My Students, Machines, Special Request, Help |
| **Technician** | Queue, Special Request, Lookup, Submit, Machines, Help |
| **Admin** | Dashboard, Submit, Special Request, Lookup, Rules, Users, Audit, Machines, Help |

## Workflow Diagrams

### DT Coursework Flow

```text
Student opens DT Submit
  |
  v
Check year-group rule + submission-control window
  |
  +--> blocked by deadline / cutoff
  |        |
  |        v
  |   student sees message and cannot submit
  |
  v
Validate dimensions, file types, preview rules
  |
  v
Write row to Submissions + AuditLog
  |
  v
Send confirmation email
  |
  v
[Submitted]
   |
   +--> [Needs Fix] ------> student revises and submits a new row
   |
   +--> [Approved] -> [In Queue] -> [In Production] -> [Completed]
   |
   +--> [Rejected]
```

### Special Request Flow

```text
Requester opens Special Request
  |
  v
Enter requester, sponsor, approver, project, machine, files
  |
  v
Write row to OtherRequests + AuditLog
  |
  v
Send requester confirmation + teacher notification
  |
  v
[Submitted]
   |
   +--> [Needs Fix]
   |        |
   |        v
   |   threaded email to requester
   |   CC teacher + technician mailbox
   |
   +--> [Approved] -> [In Queue] -> [In Production] -> [Completed]
   |
   +--> [Rejected]
```

### Reviewer Queue Flow

```text
Submissions sheet -----\\
       > merged queue -> review drawer -> status update / manual email -> AuditLog
OtherRequests sheet ---/
```

## Email Behaviour

### Automatic Confirmation Emails

- DT submissions: sent to the student and include submission ID, machine, prototype type, and next steps
- Special Requests: sent to the requester, plus a teacher-in-charge notification when applicable

### Automatic Status Emails

- sent when the status actually changes
- `Needs Fix` includes issue-template guidance where relevant
- Special Request `Needs Fix` uses a single threaded email to keep follow-up in one chain

### Reviewer-Composed Emails

The current codebase supports:

- `generateEmailDraft()` for student review emails using selected issue templates
- `generateTeacherUpdateDraft()` for teacher-facing workflow updates
- `sendComposedEmail()` for edited manual sends with audit log capture

## Setup and Deployment

### Prerequisites

- Google account with Apps Script, Drive, Sheets, and Mail access
- ability to deploy a web app within the target Google Workspace

### 1. Create the Apps Script Project

1. Open `script.google.com`.
2. Create a new project.
3. Replace the default file contents with the repository `code.gs`.

### 2. Authorise Required Scopes

1. Run `authorizeScopes()` once.
2. Accept the Mail, Drive, and Spreadsheet permissions.

### 3. Bootstrap the Backing Storage

1. Run `bootstrap()`.
2. The script creates:
   - a root Drive folder
   - `submissions/Y8/laser`
   - `submissions/Y9/laser`
   - `submissions/Y10/laser`
   - `submissions/Y10/3d`
   - `previews/Y8`
   - `previews/Y9`
   - `previews/Y10`
   - a master spreadsheet with all 7 sheets
   - seeded rules
   - seeded issue templates
   - a default admin user

### 4. Deploy as a Web App

1. Deploy as **Web app**.
2. Execute as the owner account.
3. Limit access to the intended organisation or broader audience as required.

### 5. Review School-Specific Configuration

Before production use, verify or replace:

- `APP.technicianCcEmail`
- `APP.teacherEmails`
- `APP.adminEmailOverrides`
- user-facing wording in `APP.uiText`

### 6. Configure Users and Rules

- add or update users in the `Users` sheet or Users admin page
- review all seeded `Rules`
- add `SubmissionControls` rows only when deadlines or cutoffs are needed

### 7. Verify End to End

Run at least one DT submission and one Special Request through the deployed app before real rollout.

## Maintenance Guide

### Common Tasks

| Task | How |
|---|---|
| Change size limits or allowed file types | Edit `Rules` rows |
| Set a class or year cutoff | Use the Rules page submission-control form or update `SubmissionControls` |
| Reopen a blocked class | Set the control inactive or use the reopen action |
| Change technician CC mailbox | Update `APP.technicianCcEmail` |
| Add or change teacher mapping | Update `APP.teacherEmails` and keep submit-page dropdowns aligned |
| Update admin override emails | Edit `APP.adminEmailOverrides` |
| Replace issue templates | Run `reseedIssueTemplates()` if a full reset is intended |
| Review audit history | Use Audit page or inspect the `AuditLog` sheet |
| Adjust guidance text | Update `APP.uiText` and affected page renderers |

### After Code Changes

1. save in Apps Script
2. check syntax and editor errors
3. redeploy the existing web app deployment
4. hard-refresh the browser
5. re-test any affected workflow

## Project Structure

```text
.
├── code.gs
├── README.md
├── CHANGELOG.md
├── GITHUB_PUBLISHING.md
├── LICENSE
├── docs/
│   ├── HANDOVER.md
│   ├── TECHNICAL_OVERVIEW.md
│   └── assets/
│       ├── diagrams/
│       └── screenshots/
└── .gitignore
```

## Known Limitations

- The whole application lives in one large `code.gs` file.
- Teacher names are still tied to a hardcoded mapping and submit-page dropdown content.
- There is no automated test suite in this repository.
- Google Sheets remains the operational data store, not a transactional database.
- Resubmissions create new rows instead of versioning an existing submission.
- Seeded upload folders and rules are currently focused on Y8-Y10 DT workflows.
- This workspace may be a downloaded export rather than a live Git checkout, so publication to GitHub may require local repository initialisation or syncing into a clean clone first.

## Related Documentation

- [docs/TECHNICAL_OVERVIEW.md](docs/TECHNICAL_OVERVIEW.md)
- [docs/HANDOVER.md](docs/HANDOVER.md)
- [GITHUB_PUBLISHING.md](GITHUB_PUBLISHING.md)
- [CHANGELOG.md](CHANGELOG.md)

## License

This project is released under the [MIT License](LICENSE).

Developed for Design & Technology fabrication workflow operations.

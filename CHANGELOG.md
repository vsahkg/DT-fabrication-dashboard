# Changelog

All notable changes to the Design Fabrication Dashboard.

---

## [1.0.0] — 2026-03-09

### Initial Release

Full-featured Design Fabrication Dashboard — a Google Apps Script web app for managing school fabrication submissions.

### Core System
- Single-file Google Apps Script web application (`code.gs`, ~4,960 lines)
- Google Sheets data store with 6 sheets (Submissions, OtherRequests, Rules, IssueTemplates, Users, AuditLog)
- Google Drive file storage with year-group folder hierarchy
- Role-based access control (student, teacher, technician, admin)
- Bootstrap function for one-click system setup

### DT Student Project Workflow
- Submission form with dynamic rules based on year group and machine type
- Real-time dimension validation against configured size limits
- Material selection tied to year group and machine rules
- File upload (working file + preview image) to Google Drive
- Submission checklist with live progress bar
- 7-stage status workflow (Submitted → Needs Fix → Approved → In Queue → In Production → Completed → Rejected)

### Other Request / Non-DT Project Workflow
- Separate submission pathway for non-DT departments, clubs, competitions, and events
- Extended form with 7 sections (A–G): Requester Details, Request Details, Teacher/Sponsor Approval, Fabrication Details, Files, Additional Info, Confirmation
- Responsible teacher / staff approval requirement
- Fields for competition names, deadlines, priority reasons, quantities
- Dedicated OtherRequests sheet structure
- Priority disclaimers noting DT coursework may take precedence

### Email Notifications
- Automatic emails on every status change
- Needs Fix emails: single-threaded with student as To, teacher + configured technician mailbox as CC, sender as Reply-To — enabling all parties to follow up on one thread
- 44 pre-built issue templates (30 laser, 10 3D print, 4 general) with detailed HTML fix instructions
- Separate teacher notification emails for Completed and Rejected statuses
- Confirmation emails for both DT and Other Request submissions

### Admin & Review Tools
- Admin dashboard with filter bar (status, year, machine, text search)
- Dual-source view merging DT Submissions and Other Requests
- Review drawer with status update, issue code selection, and remarks
- Email preview modal for Needs Fix drafts
- Role-specific views (technician: production queue; teacher: "my students"; admin: full access)
- Technician status restrictions (cannot set Needs Fix, Submitted, or Rejected)
- Rules management page (view/edit in sheet)
- User management page
- Audit log viewer

### Help & Guidance
- 19-section help page covering all aspects of the submission process
- Collapsible accordion sections (click to expand/collapse)
- "New Here?" quick-start hero with 3-step visual guide
- Audience cards for DT students vs Non-DT departments
- Category badges on each section: Everyone (blue), DT Students (red), Non-DT (green)
- Table of Contents with auto-expand on click
- Machine overview cards (4 machines with specs)
- Beginner file preparation guides for laser cutting and 3D printing
- Size limits reference table
- File naming conventions
- Interactive submission checklist with checkbox state
- Common mistakes guide
- Good practice tips
- Turnaround time and priority explanation
- Other Requests guidance section
- Quick Reference (6 Key Rules)

### UI/UX Features
- Welcome banner on Submit page with feature pills
- Enhanced path selector cards with "Who is this for?" guidance
- Newcomer info strip on Other Request page (Laser / 3D / Not Sure?)
- Inline help tips (?) on machine and material fields linking to relevant help sections
- Visual 3-step guide on Status page empty state
- Status page dual-source search (DT + Other Requests)
- Scroll-to-top button
- Mobile tab bar with scroll fade indicators
- Professional branded footer
- Toast notifications
- Loading states and debounced inputs
- Keyboard-accessible file upload zones
- Inline image preview for uploaded files
- Role-aware navigation (3 tabs for students, 8 for admins)

### Turnaround & Disclaimer Messaging
- Comprehensive turnaround time messaging throughout the app
- Disclaimers on Submit, Other Request, Status, and Help pages
- Clear messaging that submission does not equal same-day production
- Workflow step visualisations on success states
- DT priority notice on Other Request pathway

### Validation
- DT form: email format, required fields, dimension limits, file extension checks
- Other Request form: required sections A–G, conditional fields by role, teacher approval validation
- Server-side validation for both pathways
- Client-side dimension validation with visual feedback

### Data Integrity
- Audit logging for all status changes and email sends
- Timestamp formatting in Hong Kong time (GMT+8)
- Unique ID generation for submissions and requests

# Changelog

All notable documentation-facing changes to this repository are recorded here.

## [1.3.0-public-v120-split-source] - 2026-05-19

### Latest dashboard update

- Published the current split Apps Script source instead of the older monolithic `code.gs` snapshot.
- Added the latest student Lookup improvements: case-number search, case-number-only student references, approximate active-workshop position, estimated pickup window, submitted file links, and clearer next-action wording.
- Added the student queue/machine status experience so queue health and recent request activity can be viewed away from the lookup result card.
- Added deadline visibility on the submit form and laser queue popup, including year/class deadline handling through the `SubmissionControls` logic.
- Added the admin-only Rules queue throughput chart as a 30-day submitted-vs-finished graph, with visible daily count labels for both the blue submitted curve and the green finished curve.
- Improved queue filtering with multi-condition filtering, teacher dropdown options, material filtering, case-number quick search, dropdown auto-close behaviour, and cleaner filter controls.
- Added or refined teacher class overview features: teacher/class filters, submitted-vs-missing status, possible class mismatch hints, and spreadsheet download for teacher follow-up.
- Updated prototype type handling to include `Final Product`.
- Improved automatic and draft email content so students receive their case number, know to use the Lookup page, and see a system-generated email footer.
- Updated label printing so workshop labels include material as well as case number, requester, class/year, teacher/sponsor, and machine.
- Simplified student upload validation messaging and kept Affinity `.af` / `.afdesign`, SVG, DXF, and STL handling aligned with the visible UI.

### Public-safe preparation

- Removed the old `code.gs` snapshot from the public repository and replaced it with split source files matching the current development structure.
- Replaced live Apps Script deployment metadata with blank placeholders.
- Replaced real student rosters with sample class rosters that preserve the teacher/class feature shape without exposing personal data.
- Replaced real staff names, staff emails, admin overrides, technician contact, and school email domains with generic `example.edu` placeholders.
- Re-ran syntax checks and privacy scans before publishing this update.

## [1.2.2-case-number-status-lookup] - 2026-05-05

### Latest dashboard update

- Added source-aware case numbers: DT submissions use `M###`, while Special Requests use `A###`.
- Updated student Status Lookup cards so the visible reference is the case number only; raw Submission IDs and Request IDs remain backend/audit references but are no longer shown on lookup cards.
- Updated lookup actions to copy only the case number, giving students a short reference to quote when asking teachers or technicians for help.
- Sorted mixed DT and Special Request lookup results by submitted time instead of grouping Special Requests at the bottom.
- Added a 14-day daily request activity timeline to the queue health snapshot used by the student lookup context panel.
- Kept printed workshop labels aligned with the case-number system, including `A###` labels for Special Requests.
- Improved student and requester email wording so confirmation/update messages foreground the case number and system-generated email footer.

### Public-safe preparation

- Regenerated the published `code.gs` from the current split Apps Script deployment source.
- Replaced live Apps Script deployment metadata, staff names, staff emails, and school email examples with public-safe placeholders.
- Re-ran syntax and privacy scans before publishing the repository update.

## [1.2.1-label-printing] - 2026-05-05

### Latest dashboard update

- Added browser-based single-label printing for fabrication requests, designed for 90 x 29 mm labels and Brother QL-style printer-driver workflows.
- Added `Print Label` actions from both queue rows and request review drawers, so technicians can print labels while staying inside the active queue workflow.
- Included requester name, class/year, teacher/sponsor, machine type, and request/reference ID on each printed label.
- Added compact print styling with a fixed 90 mm x 29 mm page setup for workshop label stock.
- Kept printing driver-based: the browser print dialog opens first, then the technician selects the configured label printer and label media in the local printer driver.

### Public-safe preparation

- Synced the public repository snapshot after the live Apps Script deployment update.
- Kept deployment IDs, spreadsheet links, staff names, school emails, and student examples out of the published `code.gs` snapshot.
- Updated README wording so the repository documents the label-printing workflow alongside the queue and reviewer tools.

## [1.2.0-public-dashboard-sync] - 2026-05-04

### Dashboard release sync

- Replaced the public `code.gs` snapshot with the latest dashboard code used for the public Apps Script release.
- Added the updated Admin queue behaviour where the default sort is **Latest spreadsheet rows**, so newly appended spreadsheet submissions appear first.
- Preserved optional priority, timestamp, oldest-active, recently-updated, and requester-name sorting.
- Added full-row status colouring in the queue: completed rows are green, rejected rows are red-tinted, needs-fix rows are amber, and active production states use distinct colours.
- Added smoother Admin queue filtering by keeping quick search, sort, and focus-lane changes client-side after the main row set is loaded.
- Fixed the explicit Admin Refresh buttons so they bypass the local row cache and fetch the latest spreadsheet data.
- Changed dashboard year dropdowns to come from active Rules rows, so newly configured years such as Y6 and Y7 appear without code edits.
- Redefined queue pressure for the reduced-capacity period: Busy begins at 20 active queue items and Heavy begins above 30.
- Added a student-facing laser capacity notice explaining that one laser cutter is offline and only one laser cutter is currently running.
- Added richer Status Lookup cards with current step, student next action, next checkpoint, last update, submitted file/evidence links, and machine-specific checklists.
- Tightened role boundaries so teacher and technician users stay in the operations queue while system-admin-only pages remain admin-only.

### Public-safe preparation

- Sanitised live Apps Script deployment IDs, spreadsheet IDs, Drive IDs, staff names, staff emails, and student examples from the published code snapshot.
- Kept only neutral `example.edu` contact placeholders and generic teacher labels.
- Added a public-safe header note to `code.gs` documenting the sanitisation rules for this snapshot.

## [1.1.0-doc-sync] - 2026-03-25

### Documentation alignment

- Updated the README to match the current `code.gs` implementation instead of the earlier public-showcase snapshot.
- Corrected the data model from 6 sheets to 7 logical sheets and documented `SubmissionControls`.
- Added coverage for prototype type capture, repeat-submission activity signals, manual email draft tooling, and admin cutoff controls.
- Corrected role-based navigation descriptions and setup notes to match the current page structure.

### Technical and maintenance docs

- Refreshed the technical overview with current function groups, config surfaces, and regression-sensitive areas.
- Refreshed the handover guide with current deployment checks, QA items, and publication-safety notes.
- Updated the GitHub publishing guide to cover sanitisation review and the case where the workspace is a ZIP export rather than a live git checkout.

### Repository housekeeping

- Removed stale or misleading README wording inherited from the earlier showcase draft.
- Replaced school-specific email mappings in `code.gs` with public-safe placeholders and removed a named technician reference from public email text.
- Removed remaining email-pattern placeholders, replaced teacher identity examples with generic labels, and cleared `.mailmap` personal data.

## [1.0.0-public-showcase] - 2026-03-13

### Documentation and repository presentation

- Rewrote the README for public GitHub readers with clearer DT positioning, workflow framing, and documentation map links.
- Strengthened the documentation set across technical overview, handover guidance, changelog structure, and GitHub publishing guidance.
- Added placeholder asset structure guidance for future screenshots and diagrams.

### Public-safe preparation

- Replaced live-style email examples and contact values with neutral placeholders.
- Kept the public branch focused on reference material rather than live deployment specifics.
- Clarified repo sanitisation rules for documentation, screenshots, and future publishing.

### Workflow and UX improvements included in this snapshot

- Preserved the DT Student Project and Special Request split across the submission experience.
- Preserved the reviewer queue, review drawer, and status-driven workflow updates.
- Preserved the Machine Guide and expanded help/guidance content.

### Operational hardening included in this snapshot

- Added submission activity awareness for same-day and last-24-hour bursts.
- Added stronger reviewer context in queue and drawer views.
- Added file-size validation and lock-based protection around status changes.

## [0.9.0-public-prep] - 2026-03-09

### Initial public release preparation

- Created the first scrubbed public branch state from the internal working version.
- Added public-facing repository documentation and license files.
- Replaced remaining private contact examples with neutral placeholders.

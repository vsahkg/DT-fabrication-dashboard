# Changelog

All notable documentation-facing changes to this repository are recorded here.

## [1.2.0-public-dashboard-sync] - 2026-05-04

### Dashboard release sync

- Replaced the public `code.gs` snapshot with the latest dashboard code used for the public Apps Script release.
- Added the updated Admin queue behaviour where the default sort is **Latest spreadsheet rows**, so newly appended spreadsheet submissions appear first.
- Preserved optional priority, timestamp, oldest-active, recently-updated, and requester-name sorting.
- Added full-row status colouring in the queue: completed rows are green, rejected rows are red-tinted, needs-fix rows are amber, and active production states use distinct colours.
- Added smoother Admin queue filtering by keeping quick search, sort, and focus-lane changes client-side after the main row set is loaded.
- Fixed the explicit Admin Refresh buttons so they bypass the local row cache and fetch the latest spreadsheet data.
- Changed dashboard year dropdowns to come from active Rules rows, so newly configured years such as Y6 and Y7 appear without code edits.
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

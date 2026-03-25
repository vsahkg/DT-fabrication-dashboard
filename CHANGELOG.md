# Changelog

All notable documentation-facing changes to this repository are recorded here.

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

## [1.0.0-public-showcase] - 2026-03-13

### Documentation and repository presentation

- Rewrote the README for public GitHub readers with clearer VSA DT positioning, workflow framing, and documentation map links.
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
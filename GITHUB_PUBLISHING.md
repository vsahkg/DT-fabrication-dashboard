# GitHub Publishing Guide

Use this guide when preparing future public versions of the VSA DT Fabrication Dashboard repository.

The goal is to keep the public branch presentation-ready, sanitized for public reference, and aligned with the VSA Design Technology Department's intended external-facing documentation quality.

## Public Branch Intent

The public repository should represent:

- a public showcase repository
- a school fabrication workflow dashboard built on Google Apps Script
- departmental documentation suitable for handover and public reference

It should not function as a raw export of the live internal deployment.

## What Must Be Checked Before Every Public Push

Confirm the repository does not contain:

- real staff email addresses
- personal contact information
- deployment URLs
- internal spreadsheet IDs
- Google Drive folder IDs
- access tokens, credentials, or secrets
- screenshots containing private student or staff data
- internal-only notes or operational details that should stay private

## Values That Must Stay Placeholder-Safe

Review these areas before publishing:

- `APP.technicianCcEmail`
- `APP.teacherEmails`
- email placeholders shown in forms and help text
- organisation branding text in the footer or help content
- any newly added config constants that reference real people or live systems

## Screenshot Review Checklist

If screenshots are added to the repo, verify that they:

- use the sanitized public branch UI
- do not show real student names, classes, or email addresses
- do not show live submission IDs that could expose internal records
- do not reveal spreadsheet URLs, Drive URLs, or admin-only links
- match the current terminology used in the README and docs

## Documentation Refresh Checklist

Before publishing, confirm that these files remain aligned:

- `README.md`
- `CHANGELOG.md`
- `docs/TECHNICAL_OVERVIEW.md`
- `docs/HANDOVER.md`
- `GITHUB_PUBLISHING.md`

Specifically check:

- project naming consistency
- DT Student Project vs Special Request terminology
- documentation links
- feature descriptions still matching the codebase
- public-safe language throughout

## License and Attribution Check

Before pushing, confirm:

- `LICENSE` is present and intentional
- README ownership wording still reflects VSA Design Technology Department authorship appropriately
- no third-party copyrighted assets were added without permission

## Suggested Git Workflow

1. keep live deployment values in a private branch or private fork
2. prepare a public-safe branch for review
3. replace any real contacts with placeholders before commit
4. refresh documentation if functionality or terminology changed
5. review screenshots and assets for privacy
6. push only after the public-safe checklist is complete

## Final GitHub Pre-Publish Checklist

- repo title and README opening section still present the project clearly
- public badges and links render correctly
- documentation links are not broken
- no merge markers or draft placeholder text remain
- no private strings are visible in tracked files
- screenshots and diagrams, if present, are public-safe
- changelog reflects the latest public showcase update

## Suggested GitHub About Text

VSA DT Fabrication Dashboard is a Google Apps Script workshop management tool that demonstrates a school fabrication workflow system for DT Student Projects, Special Requests, reviewer queue operations, and status communication.
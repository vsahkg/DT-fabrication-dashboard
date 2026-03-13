# GitHub Publishing Notes

This repository is intended to be publishable as a public showcase.

## Public Repository Rules

Before pushing changes to GitHub, confirm that the repo does not contain:

- real staff email addresses
- internal spreadsheet IDs
- private deployment URLs
- organisation-only credentials or secrets
- internal-only documentation that should not be public

## Safe Public Defaults In This Repo

The current repository already uses placeholder-safe values for:

- technician notification mailbox
- teacher email mappings
- sample school email placeholders shown in the UI

## Before A Real Deployment

If you use this repository as a starting point for a live school deployment, replace the placeholder values locally or in a private fork before going live.

Key places to review:

- `APP.technicianCcEmail`
- `APP.teacherEmails`
- any UI copy showing sample email formats
- organisation branding text in help/footer content

## Suggested Git Workflow

1. keep public-safe code on the public branch
2. use a private branch or private fork for real deployment values
3. never commit real organisation contacts back to the public repo

## Suggested GitHub About Text

Design Fabrication Dashboard is a Google Apps Script workflow tool for school fabrication requests, including submission intake, review queues, status tracking, and workshop operations.
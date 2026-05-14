# GitHub Publishing Guide

Use this guide before pushing this project to GitHub.

The goal is simple: publish an accurate, well-documented repository without leaking school-specific operational data.

## Publishing Intent

The GitHub repository should present this project as:

- a Google Apps Script fabrication workflow dashboard
- a school workshop operations tool
- a repository with documentation that matches the current code snapshot

It should not become a raw dump of live deployment details.

## Mandatory Pre-Publish Checks

Review the repository for:

- real staff email addresses
- personal contact details
- spreadsheet IDs
- Google Drive folder IDs
- deployment URLs
- credentials or tokens
- real class rosters, student names, student IDs, or student email addresses
- screenshots containing private student or staff data
- internal-only notes or comments

## Values That Need Explicit Review

Check these parts of `code.gs` every time:

- `APP.technicianCcEmail`
- `APP.teacherEmails`
- `APP.teacherBetaClasses`
- `APP.adminEmailOverrides`
- any hardcoded example emails in page content
- footer or help text that may reference internal branding or live behaviour

## Documentation Refresh Checklist

Before pushing, confirm these files are still aligned with the codebase:

- `README.md`
- `CHANGELOG.md`
- `docs/TECHNICAL_OVERVIEW.md`
- `docs/HANDOVER.md`
- `GITHUB_PUBLISHING.md`

Specifically re-check:

- sheet count and data model descriptions
- role and navigation descriptions
- DT Submit versus Special Request terminology
- admin tooling descriptions
- Class Submission tracker and export descriptions
- public-safety wording

## Screenshots and Assets Checklist

If screenshots or diagrams are added:

- use a sanitised environment
- do not show real names, classes, or emails unless intentionally public
- avoid showing sheet URLs, Drive URLs, or admin-only data
- keep screenshots consistent with the current terminology in the docs

## If This Workspace Is Not A Git Checkout

This folder may be a ZIP export or downloaded snapshot.

If there is no `.git` directory, use one of these paths before publishing:

1. initialise a local git repository in this folder, add the correct remote, and commit intentionally, or
2. copy these updated files into a clean clone of the target GitHub repository and publish from there

Do not guess the remote or branch history.

## Suggested Publish Workflow

1. review and sanitise school-specific config
2. refresh docs if code or wording changed
3. inspect assets for privacy issues
4. verify the workspace is connected to the correct git remote
5. commit only the intended files
6. push only after the repository is public-safe

## Final GitHub Checklist

- README opening section still explains the project clearly
- all markdown links resolve
- no stray draft text or merge markers remain
- changelog includes the current update
- screenshots and diagrams are safe to publish
- the branch does not contain private operational strings

## Suggested GitHub About Text

Design Fabrication Dashboard is a Google Apps Script workshop management tool for DT coursework submissions, Special Requests, reviewer queue operations, and fabrication status communication.

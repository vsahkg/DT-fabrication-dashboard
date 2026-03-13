# Handover Guide

This document explains how to maintain, adapt, and deploy the Design Fabrication Dashboard.

## What This Repository Is

This is a public showcase of a Google Apps Script fabrication workflow dashboard.

It demonstrates:
- submission handling
- workshop queue operations
- review workflow design
- status tracking
- notification flow
- help and machine guidance content

It does not contain live private deployment values.

## Before Real Deployment

Replace these placeholder values in `code.gs`:

- `APP.technicianCcEmail`
- `APP.teacherEmails`
- email placeholders shown in form text if needed
- any branding or departmental wording you want to customize

Also verify:
- spreadsheet ownership
- Drive folder permissions
- Apps Script deployment access settings
- organisation mail quota and policy

## Recommended Setup Process

1. Create a new Google Apps Script project.
2. Paste in the current `code.gs`.
3. Run the authorisation/setup helpers.
4. Replace placeholder teacher and technician values.
5. Deploy as a web app.
6. Create or verify the backing spreadsheet and Drive folders.
7. Test with at least one student, one teacher, and one technician/admin account.

## How To Work Safely In This Codebase

### 1. Make small edits
Because most UI is embedded in large template strings, broad edits can introduce syntax mistakes quickly.

### 2. Validate after each change
Run a syntax/error check after editing `code.gs`.

### 3. Do not rename data headers casually
The sheet headers and runtime object keys are tightly coupled.

### 4. Keep public and private config separate
If this repo remains public, never commit:
- real staff emails
- school-specific auth or API secrets
- production spreadsheet IDs
- private deployment URLs

## Common Maintenance Tasks

### Update teacher list
Edit `APP.teacherEmails`.

### Change technician CC mailbox
Edit `APP.technicianCcEmail`.

### Adjust machine/year rules
Edit rules data or the live Rules sheet, depending on deployment approach.

### Update queue UX
Work in:
- queue helper functions
- queue CSS
- admin queue row renderer

### Update reviewer drawer UX
Work in:
- drawer helper functions
- drawer CSS
- `openDrawer()` rendering

## Manual QA Checklist

After meaningful changes, verify:

1. submit flow still works for DT and Special Request paths
2. status lookup still returns rows correctly
3. admin queue still loads and filters correctly
4. `My students only` still works
5. clicking Review / View still opens the correct drawer row
6. saving a status change still updates the sheet and UI
7. mobile queue layout still stacks cleanly
8. no syntax errors are reported in `code.gs`

## Public Repo Maintenance Rule

If new internal deployment values get added later, sanitize them before pushing to GitHub.

This includes:
- teacher dropdown defaults
- notification recipients
- footer/branding copy if it contains internal-only references
- help text that exposes private internal process details
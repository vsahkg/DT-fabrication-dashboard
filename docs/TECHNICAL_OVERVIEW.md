# Technical Overview

This repository contains a single-file Google Apps Script web application in `code.gs`.

## High-Level Architecture

The application combines four layers inside one file:

1. configuration and seeded sample data
2. server-side Apps Script functions
3. page rendering with HtmlService
4. client-side JavaScript and CSS embedded in the rendered HTML

This is a deliberate deployment-oriented architecture. It is less modular than a multi-file web app, but it maps well to Apps Script’s editing and deployment model.

## Main Runtime Components

### Configuration Layer
Key global configuration lives in the `APP` object near the top of `code.gs`.

It defines:
- application metadata
- sheet schemas
- sample rules and issue templates
- teacher email placeholders
- user-facing UI copy
- status enum values

### Server API Layer
These functions are called from the browser through `google.script.run`.

Important examples:
- submission handlers
- status lookup handlers
- admin queue loaders
- status update handlers
- file upload handler
- admin maintenance functions

### Rendering Layer
`renderPage_()` builds the full HTML document.

It embeds:
- page shell
- all CSS
- all client-side JavaScript
- all page fragments like submit, status, admin, machines, help

### Client Layer
The browser logic handles:
- page switching
- form interactions
- queue rendering
- review drawer behavior
- status search
- toast messages
- file upload calls
- filter interactions

## Core System Areas

### DT Submission Flow
Supports regular Design and Technology coursework.

Key concerns:
- year-group rules
- machine selection
- dimensions
- file validation
- submission save
- confirmation email

### Special Request Flow
Supports non-DT or extended fabrication requests.

Adds:
- sponsor/teacher details
- approval info
- request purpose
- deadline context
- extra project metadata

### Admin Queue
The queue is the main operational surface for teachers, technicians, and admins.

It currently provides:
- merged DT and Special Request rows
- source distinction
- queue filters
- scoped teacher view
- compact operational row layout
- repeat submission signals
- action button opening the review drawer

### Review Drawer
The review drawer is where detailed operational context lives.

It includes:
- requester details
- fabrication details
- submitted / updated timestamps
- owner and action cues
- repeat activity warning
- recent requester history
- status update controls

## Data Model Summary

### `Submissions`
DT coursework records.

### `OtherRequests`
Special Request records.

### `Rules`
Machine/year-group validation rules.

### `IssueTemplates`
Reusable reviewer feedback templates.

### `Users`
Role assignments.

### `AuditLog`
Operational audit trail.

## Current Operational Enhancements In This Snapshot

The current public snapshot includes:

- same-day and last-24h submission activity tracking
- row-level activity metadata for queue and status pages
- improved admin queue hierarchy and responsive layout
- richer review drawer summary
- document locking around status updates
- server-side file size validation
- stronger Needs Fix messaging

## Important Functions To Understand

### Submission and Validation
- `submitSubmission`
- `submitOtherRequest`
- validation helpers

### Queue and Status Data
- `getStudentStatuses`
- `getOtherRequestStatuses`
- `getAdminRows`
- `getAdminOtherRequests`
- submission activity helpers

### Status Updates
- `updateSubmissionStatus`
- `updateOtherRequestStatus`

### Notifications
- `sendStatusNotification_`
- `sendOtherRequestNotification_`
- confirmation email helpers

### Rendering
- `renderPage_`
- `renderSubmitPage_`
- `renderOtherRequestPage_`
- `renderStatusPage_`
- `renderAdminPage_`
- `renderMachinesPage_`
- `renderHelpPage_`

## Sensitive Areas

When modifying the app, these areas are the easiest places to break behavior:

- template literal HTML inside page renderers
- queue row rendering strings
- review drawer rendering strings
- status enum usage across server/client code
- sheet header definitions versus spreadsheet columns
- email copy and recipient logic

## Maintenance Guidance

- Prefer small edits when changing large template strings.
- Validate with a syntax check after each patch.
- Keep private deployment values out of the public repo.
- Treat the review drawer as the detail layer and the queue as the summary layer.
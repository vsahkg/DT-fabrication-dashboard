# Handover Guide — Design Fabrication Dashboard

Maintenance and day-to-day administration guide for the Design Fabrication Dashboard, a Google Apps Script web app.

---

## Safe Editing Guidelines

The entire application is a single `code.gs` file. Editing is done in the **Apps Script editor** (`script.google.com`).

**Before every change:**
1. Copy the current `code.gs` into a local backup (or rely on git history).
2. Make your change.
3. Click **Deploy → Test deployments** and open the test URL.
4. Verify the page loads and the affected feature works.
5. When satisfied, click **Deploy → Manage deployments → Edit → Version → New version → Deploy**.

**Avoid:**
- Renaming any column header in the `APP.sheets` configuration without also renaming it in the actual spreadsheet (or vice versa).
- Changing status codes in `APP.status` without a full search-and-replace across the file.
- Editing inside template literal strings (`` ` ``) without checking that all `${}` interpolations still resolve.

---

## Common Maintenance Tasks

### Add or Update a Teacher Email

Teacher emails are mapped in the `APP.teacherEmails` object (near the top of the file). The public repository uses placeholders, so replace them with your real staff directory before deployment:

```js
teacherEmails: {
  'Teacher A': 'teacher.a@example.edu',
  'Teacher B': 'teacher.b@example.edu',
  // add new teachers here
},
```

Students select their teacher's **name** from a dropdown. The system looks up the email here. If a teacher is missing, their students' confirmation emails won't CC the teacher.

### Add or Change a Cutting Rule

1. Open the master spreadsheet → **Rules** sheet.
2. Add or edit a row with: Machine, Year Group, Max Length, Max Width, Max Height, Active (TRUE/FALSE).
3. Students will see the new rule the next time they load the submit page.

Alternatively, edit `APP.sampleRules` and re-run `bootstrap()`, but this overwrites all existing rules.

### Add or Modify Issue Templates

Issue templates (the pre-written "Needs Fix" descriptions) are in `APP.sampleIssues` (~44 entries). To update them:

1. Edit the `APP.sampleIssues` array in `code.gs`.
2. In the Apps Script editor, run the function `reseedIssueTemplates()`.
3. This overwrites the **IssueTemplates** sheet with the values from code.

To add a template via the spreadsheet directly, add a row to the IssueTemplates sheet with: Code, Category, Label, Description, Active.

### Change the Technician CC Email

Edit `APP.technicianCcEmail` near the top of the file:

```js
technicianCcEmail: 'dt-technician@example.edu',
```

This is the address CC'd on all "Needs Fix" emails so the technician can follow up.

### Add a New Admin User

1. Go to the web app → **Users** page (admin only).
2. Click **Add User** and enter their email, name, and select the `admin` or `technician` role.

Or add them directly in the **Users** sheet of the spreadsheet.

### Change the Turnaround Messaging

The submit page shows estimated turnaround times. These are defined in `APP.uiText`:

```js
uiText: {
  turnaroundTitle: '...',
  turnaroundBody: '...',
  ...
}
```

Edit these strings to change what students see.

---

## Adding a New Page

If you need to add a new page (e.g. "Reports"):

1. Create a `renderReportsPage_()` function that returns an HTML string.
2. In `renderPage_()`, add a call to your function and wrap it in a `<div class="page" data-page="reports">` container.
3. In the navigation `<nav>` HTML, add a link: `<a href="#" data-page="reports">Reports</a>`.
4. If the page needs initialisation, add an `initReportsPage()` function in the client JS and wire it into `switchPage()`.
5. If it should be admin-only, add a role check in the nav rendering (search for `isAdmin` in the nav HTML).

---

## Testing Approach

There is no automated test suite. Testing is done manually:

1. **Test deployment**: Always use **Deploy → Test deployments** first.
2. **Test as different roles**: Open the test URL while logged in as different Google accounts (student, teacher, admin, technician) to check role-based behaviour.
3. **Key test scenarios**:
   - Submit a DT project → check confirmation email → check spreadsheet row
   - Submit an Other Request → check confirmation email → check spreadsheet row
   - Admin: change status to Needs Fix → check email goes to student with CC to teacher + technician
   - Admin: change status to Completed → check email goes to student
   - Student: look up status by email → verify records appear
   - Verify that non-admin users cannot see admin pages
4. **Check the Audit Log** sheet after each status change to confirm logging works.

---

## Deployment Checklist

When deploying a new version:

- [ ] Backup `code.gs` (or commit to git)
- [ ] Edit code in Apps Script editor
- [ ] Test with **Test deployments** URL
- [ ] Verify at least: page loads, submission works, admin dashboard loads, email sends
- [ ] **Deploy → Manage deployments → Edit → New version → Deploy**
- [ ] Open the production URL and verify it loads

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Page shows "Sorry, unable to open the file" | Deployment error (syntax) | Check for unclosed template literals or missing `)` |
| Submission silently fails       | Validation error not surfaced | Check browser console, test with valid payload |
| Emails not sending              | MailApp quota exhausted | Check **Executions** in Apps Script; daily quota is ~100 for free accounts |
| Admin page shows empty table    | Spreadsheet not found | Re-run `bootstrap()` or check `PropertiesService` keys |
| Status update "permission denied" | User not in Users sheet | Add them via the Users page or directly in the sheet |
| "Cannot read properties" error  | Column header mismatch | Compare `APP.sheets.*.headers` with actual spreadsheet column headers |
| File upload fails               | File exceeds 25 MB | The client enforces 25 MB; if changed, also adjust `Utilities.base64Decode` limits |

---

## Key Contacts

| Role | Email | Responsibility |
|------|-------|---------------|
| Technician mailbox (CC on Needs Fix) | `dt-technician@example.edu` | Follows up on flagged submissions |
| Script Owner / Admin | *(your Google account)* | Deployment, user management, rule changes |

---

## Architecture Decisions & Rationale

- **Single file**: Google Apps Script projects can have multiple `.gs` files, but keeping everything in one file simplifies copy-paste deployment and ensures the script editor loads everything together.
- **Pre-rendered pages**: All pages are included in the initial HTML load (toggled via CSS). This avoids flicker and removes the need for client-side routing, at the cost of a larger initial payload.
- **Sheet-based storage**: Google Sheets was chosen because it requires no additional services, can be viewed/edited directly by admins, and integrates natively with Apps Script.
- **No external dependencies**: The app has zero NPM packages or CDN imports. All CSS and JS are inline. This eliminates supply-chain risk and works within Apps Script's sandboxed environment.

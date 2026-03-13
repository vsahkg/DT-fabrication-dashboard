# Publishing to GitHub

Instructions for publishing the **Design Fabrication Dashboard** repository to GitHub.

---

## Repository Details

| Field | Value |
|-------|-------|
| **Repository name** | `design-fabrication-dashboard` |
| **Description** | A Google Apps Script fabrication request dashboard for DT coursework and non-DT school projects, with review workflows, status tracking, email notifications, and setup documentation. |

## Recommended Visibility

**Private first.** Switch to public only if school approval allows. The codebase contains no secrets, but it is an internal workflow tool and the decision to open-source should be deliberate.

---

## Manual GitHub Steps

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `design-fabrication-dashboard`
3. **Description**: `A Google Apps Script fabrication request dashboard for DT coursework and non-DT school projects, with review workflows, status tracking, email notifications, and setup documentation.`
4. Choose your visibility (Private recommended initially)
5. **Do not** add a README, .gitignore, or license from the GitHub UI — they already exist in this repo
6. Click **Create repository**

---

## Local Commands to Run After Repo Creation

```bash
cd "/Users/wcchun/Documents/untitled folder 2"
git remote add origin <PASTE_GITHUB_REPO_URL_HERE>
git branch -M main
git push -u origin main
```

Replace `<PASTE_GITHUB_REPO_URL_HERE>` with the URL shown on the GitHub repo page after creation (e.g. `https://github.com/wcchun1234/design-fabrication-dashboard.git`).

---

## If Remote Already Exists

If you already added a remote and need to update it:

```bash
git remote -v
git remote set-url origin <PASTE_GITHUB_REPO_URL_HERE>
git push -u origin main
```

---

## Recommended GitHub Topics

After pushing, go to the repository page on GitHub and click the gear icon next to **About** to add these topics:

```
google-apps-script
google-sheets
google-drive
mailapp
school-workflow
fabrication
laser-cutting
3d-printing
internal-tool
dashboard
```

---

## Verify After Push

- [ ] Repository appears on GitHub with all files
- [ ] README renders correctly on the repo front page
- [ ] CHANGELOG, TECHNICAL_OVERVIEW, and HANDOVER are accessible under `docs/`
- [ ] No secrets or credentials are visible in the commit history
- [ ] Repository description and topics are set

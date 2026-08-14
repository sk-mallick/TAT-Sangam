# 📅 TAT SANGAM

A student daily planner & academic portal web app — timetable, to-do list, quick links, and live clock with PHP & MySQL authentication.

## 🚀 Getting Started

Just open `login.html` in any modern browser (or serve the folder with any static server, e.g. `npx serve` or GitHub Pages).

### 🔑 Default Login (universal account)

| Field | Value |
|---|---|
| ID (Registration No.) | `admin` |
| Password | `admin123` |

The admin account is auto-created on first load, so you can log in immediately without signing up. You can also create your own account via the Sign Up page.

## ✨ Features

- **Login / Signup** — multi-step signup with validation; passwords are stored as SHA-256 hashes
- **Timetable** — daily class schedule with live status colors (upcoming 🟡 / ongoing 🟢 with countdown / finished 🔴) and a monthly calendar view
- **To-Do List** — priorities, deadlines, filters (All / Pending / Done), delete mode; tasks auto-sort by deadline then priority
- **Quick Links** — categorized (Personal / Quick Access / AI Tools) with custom icons and colors
- **Live Clock** — 12-hour clock with day and date
- **Data Export** — click the download button in the header to save a JSON backup of your data

## 🛠️ Fixes in this version (v1.1.0)

1. **Universal default account** (`admin` / `admin123`) seeded automatically.
2. **Password hashing** — new accounts store SHA-256 hashes; old plain-text accounts are auto-migrated on next login.
3. **XSS fixed** — task titles and other user text are HTML-escaped before rendering.
4. **Wrong-task deletion fixed** — deleting a task while a filter was active used the filtered index and could delete the wrong task.
5. **Timer memory leak fixed** — timetable countdown intervals were never cleared and stacked up on every re-render.
6. **Auto-refreshing class statuses** — timetable colors now update every minute without a reload; countdowns stop cleanly when a class ends.
7. **Crash-prone code removed** — an unguarded top-level `logoutBtn` listener could break the whole script on pages missing that button.
8. **Link color now works** — the color picker value was saved but never applied; icons now use your chosen color.
9. **Link URL validation** — `https://` is auto-prefixed and invalid URLs are rejected; external links open with `rel="noopener noreferrer"`.
10. **Smarter icon guessing** — "My GitHub Repo" now matches the GitHub icon (partial matching instead of exact match only).
11. **Reserved ID protection** — users can't sign up with the `admin` ID.
12. **Broken "[FOOD] Break" text** replaced with 🍽️ Break.

## ⚠️ Security Note

This is a client-side-only app. localStorage is not a secure credential store — anyone with access to the browser can read or modify the data. The hashing is a hardening step, not real security. Don't reuse important passwords here.

## 📂 Files

```
index.html    → main planner dashboard
login.html    → login page
signup.html   → two-step signup
auth.js       → authentication, default admin, hashing
script.js     → planner logic (todos, links, timetable, clock)
style.css     → all styling
export-data-snippet.txt → console snippet to dump ALL localStorage (legacy; use the in-app export button instead)
```

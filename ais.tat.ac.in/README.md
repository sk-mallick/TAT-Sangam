# TAT SANGAM — AIS Integration

Everything that touches `ais.tat.ac.in` lives in this folder.

Open it at:

    http://localhost/TAT%20SANGAM/ais.tat.ac.in/

## Two ways to get your attendance

### 1. This page (`index.html`) — sign in once, stay signed in

    Browser -> ais.php (your backend) -> AIS login -> attendance page
            -> semester form -> parse -> JSON -> page

You sign in once and stay signed in until you press **Sign out** — reloading
or closing the browser does not log you out. Semesters can be switched at any
time without retyping anything.

**How the password is held.** Staying signed in requires keeping it, so:

| | |
|---|---|
| Encryption | AES-256-GCM (authenticated) before it touches disk |
| Key location | generated per sign-in, stored **only** in your browser cookie |
| Server file | `_store/<token>.bin`, ciphertext only — undecryptable alone |
| Cookie | HttpOnly, SameSite=Lax, 30 days, unreadable from JavaScript |
| Sign out | deletes the file *and* expires the cookie |

Neither half is enough on its own: the file has no key, the cookie points at
nothing once the file is gone. `_store/` is also blocked over HTTP (403).

> This is meaningfully safer than storing a plaintext password, but it is not
> magic — someone with **both** your logged-in browser and the server file can
> recover it. On localhost that is you. If you ever deploy this, the site
> **must** be HTTPS, or the password crosses the network in clear text.

### 2. `tat-attendance.user.js` — no password at all

Runs inside the portal in your own browser, reusing the session you are already
logged into. Paste it into DevTools (F12 → Console) on ais.tat.ac.in, or install
it with Tampermonkey. Nothing is sent anywhere and no password is involved.
This is the safer option if you only need your own data.

## How the AIS flow actually works

Confirmed against the live portal and a real HAR capture:

| Step | Request |
|---|---|
| 1 | `GET /ais/` — establishes `JSESSIONID` |
| 2 | `POST /ais/nextsislogin.jsp` — fields `username`, `password`. No CSRF token, no captcha |
| 3 | 302 → `/ais/studsuclogin.jsp` (dashboard; carries `Welcome , <NAME>`) |
| 4 | `GET /ais/studportal/attendancedetails.jsp` — **not** the table. Serves Student Information + a "Select Semester" form |
| 5 | Submit that form with a semester → the real attendance table |

Step 4 is the part that is easy to miss: the attendance link does not return
attendance. `ais.php` detects the semester form, replays its hidden fields with
the chosen semester, and parses the result.

Student Information is read straight off step 4, so no extra request to
`viewprofile.jsp` is needed. It arrives as **two label/value pairs per row**
(`["Registration number","2301289114","Session:","2026-2027"]`), which is why
the profile parser walks each row in pairs.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page — sign-in, student card, summary, attendance table |
| `ais.php` | Endpoint. `POST action=login\|fetch\|status\|logout` |
| `_store/` | Encrypted sign-in blobs. Blocked over HTTP; delete to force sign-out |
| `ais_lib.php` | Connector + parsers. Pure library, safe to include from tests |
| `tat-attendance.user.js` | In-browser panel (option 2 above) |
| `_test-fixture.html` | Mock JSP page — parser picks the data table out of layout tables |
| `_test-nomatch.html` | Verifies the structure-report fallback |
| `_test-expired.html` | Verifies expired-session detection |
| `ais.tat.ac.in.har` | Network capture. **Contains a plaintext password — do not commit or share** |

`style.css` is a copy of `../Project/style.css` so this folder stands alone.
Note the tradeoff: a fix made to one copy does not reach the other.

## When parsing fails

The attendance table markup is matched by *scoring* every table's headers, not
by a hardcoded selector. If nothing matches, the page still shows whatever it
did read (your profile) and prints a **structure report** listing every form and
table on the page — action, method, field names, headers, first row.

That report is the thing to send on. It is enough to point the column matching
at the right headers in one pass.

## Known-good behaviour

- Cloudflare fronts the portal with passive JS-detection. Server-side cURL
  reaches it fine today (verified: HTTP 200, `JSESSIONID` issued).
- If Cloudflare ever returns 403/429/503 with a challenge, `ais.php` reports
  that specifically instead of claiming a wrong password. Do not try to work
  around a challenge — use option 2, or ask TAT IT for approved API access.
- Percentages are always recomputed from `attended / held`, never scraped.

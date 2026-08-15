// ==UserScript==
// @name         TAT SANGAM - Attendance Panel
// @namespace    https://ais.tat.ac.in/
// @version      1.0.0
// @description  Reads your own AIS attendance page and shows it as a TAT SANGAM styled panel with target-attendance maths.
// @match        https://ais.tat.ac.in/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
 * Runs INSIDE ais.tat.ac.in, in your own browser, using the session you are
 * already logged into. It performs one same-origin GET of the attendance page
 * you could open by clicking the link yourself, then reformats it.
 *
 * No password is read, stored or transmitted. Nothing is sent anywhere.
 *
 * Two ways to run it:
 *   1. Tampermonkey - install this file as a userscript.
 *   2. No install   - log into AIS, open DevTools (F12) > Console, paste the
 *                     whole file, press Enter.
 */

(function () {
    'use strict';

    var ATTENDANCE_URL = '/ais/studportal/attendancedetails.jsp';
    var HOST_ID = 'tat-sangam-attendance-host';
    var DEFAULT_TARGET = 75;

    if (document.getElementById(HOST_ID)) {
        document.getElementById(HOST_ID).remove();          // re-running replaces the old panel
    }

    // ------------------------------------------------------------------
    // Styles - TAT SANGAM neo-brutalist tokens, isolated in a shadow root
    // so the portal's own CSS cannot bleed in (and we cannot break theirs).
    // ------------------------------------------------------------------
    var CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Inter, "Segoe UI", system-ui, sans-serif; }

    :host {
      --ink: #141414;
      --bg: #f6f2e6;
      --surface: #ffffff;
      --surface-2: #efe9d8;
      --text: #141414;
      --muted: #6a6a6a;
      --primary: #5b5bf5;  --primary-ink: #ffffff;
      --success: #16c76a;  --success-soft: #d3f7e3;
      --warning: #ffc53d;  --warning-soft: #fff2cc;
      --danger:  #ff5a5a;  --danger-soft:  #ffe0e0;
      --bw: 2px; --bw-thick: 3px; --r-sm: 4px;
      --sh-sm: 2px 2px 0 var(--ink);
      --sh:    3px 3px 0 var(--ink);
      --sh-lg: 5px 5px 0 var(--ink);
    }

    .backdrop {
      position: fixed; inset: 0; background: rgba(20,20,20,0.45);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 24px 16px; overflow: auto; z-index: 2147483647;
    }
    .panel {
      width: 100%; max-width: 760px; background: var(--bg);
      border: var(--bw-thick) solid var(--ink); border-radius: var(--r-sm);
      box-shadow: var(--sh-lg); color: var(--text);
    }

    .bar {
      display: flex; align-items: center; gap: 12px;
      background: var(--primary); color: var(--primary-ink);
      border-bottom: var(--bw-thick) solid var(--ink);
      padding: 10px 14px;
    }
    .bar h2 { font-size: 0.95rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px; flex: 1; }
    .bar button {
      background: #fff; color: var(--ink); border: var(--bw) solid var(--ink);
      border-radius: var(--r-sm); box-shadow: var(--sh-sm);
      font-weight: 900; font-size: 0.72rem; text-transform: uppercase;
      padding: 5px 10px; cursor: pointer; letter-spacing: 0.3px;
    }
    .bar button:hover { background: var(--warning); }
    .bar button:active { transform: translate(2px,2px); box-shadow: none; }

    .controls {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      padding: 12px 14px; border-bottom: var(--bw) solid var(--ink);
      background: var(--surface-2);
    }
    .controls label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px; }
    .controls input {
      width: 70px; padding: 5px 8px; font-weight: 800; font-size: 0.85rem;
      border: var(--bw) solid var(--ink); border-radius: var(--r-sm);
      background: #fff; color: var(--ink);
    }
    .synced { margin-left: auto; font-size: 0.68rem; font-weight: 800; color: var(--muted); text-transform: uppercase; }

    .body { padding: 14px; }

    .summary {
      display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px;
    }
    .stat {
      flex: 1 1 150px; background: var(--surface);
      border: var(--bw) solid var(--ink); border-radius: var(--r-sm);
      box-shadow: var(--sh-sm); padding: 10px 12px;
    }
    .stat .k { font-size: 0.64rem; font-weight: 900; text-transform: uppercase; color: var(--muted); letter-spacing: 0.4px; }
    .stat .v { font-size: 1.5rem; font-weight: 900; line-height: 1.15; }

    table { width: 100%; border-collapse: collapse; background: var(--surface);
            border: var(--bw) solid var(--ink); border-radius: var(--r-sm); overflow: hidden; }
    th {
      background: var(--ink); color: #fff; text-align: left;
      font-size: 0.64rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px;
      padding: 8px 10px;
    }
    td { padding: 8px 10px; border-top: var(--bw) solid var(--ink); font-size: 0.84rem; font-weight: 600; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 800; }
    .subject { font-weight: 800; }
    .subject .code {
      display: block; font-size: 0.64rem; font-weight: 800;
      color: var(--muted); text-transform: uppercase; letter-spacing: 0.3px;
    }

    .pill {
      display: inline-block; padding: 1px 8px; border-radius: 999px;
      border: var(--bw) solid var(--ink); font-size: 0.72rem; font-weight: 900;
      font-variant-numeric: tabular-nums;
    }
    .ok   { background: var(--success-soft); }
    .warn { background: var(--warning-soft); }
    .bad  { background: var(--danger-soft); }

    .advice { font-size: 0.72rem; font-weight: 700; color: var(--muted); }
    .advice b { color: var(--text); font-weight: 900; }

    .note {
      border: var(--bw) solid var(--ink); border-left: 8px solid var(--warning);
      background: var(--warning-soft); border-radius: var(--r-sm);
      padding: 10px 12px; font-size: 0.8rem; font-weight: 700; margin-bottom: 12px;
    }
    .note.err { border-left-color: var(--danger); background: var(--danger-soft); }
    .note code { font-family: ui-monospace, Consolas, monospace; font-size: 0.76rem; }

    pre {
      background: var(--surface); border: var(--bw) solid var(--ink); border-radius: var(--r-sm);
      padding: 10px; font-size: 0.72rem; font-family: ui-monospace, Consolas, monospace;
      overflow-x: auto; white-space: pre; margin-top: 10px; max-height: 320px;
    }
    .spin { padding: 30px; text-align: center; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    `;

    // ------------------------------------------------------------------
    // Mount
    // ------------------------------------------------------------------
    var host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: 'open' });
    root.innerHTML =
        '<style>' + CSS + '</style>' +
        '<div class="backdrop">' +
          '<div class="panel">' +
            '<div class="bar">' +
              '<h2>TAT Sangam &middot; Attendance</h2>' +
              '<button data-act="refresh">Refresh</button>' +
              '<button data-act="close">Close</button>' +
            '</div>' +
            '<div class="controls">' +
              '<label for="tgt">Target %</label>' +
              '<input id="tgt" type="number" min="1" max="100" value="' + DEFAULT_TARGET + '">' +
              '<span class="synced"></span>' +
            '</div>' +
            '<div class="body"><div class="spin">Loading attendance&hellip;</div></div>' +
          '</div>' +
        '</div>';

    var bodyEl   = root.querySelector('.body');
    var syncedEl = root.querySelector('.synced');
    var targetEl = root.querySelector('#tgt');
    var lastRows = null;

    function close() { host.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    root.querySelector('[data-act="close"]').addEventListener('click', close);
    root.querySelector('[data-act="refresh"]').addEventListener('click', load);
    root.querySelector('.backdrop').addEventListener('click', function (e) {
        if (e.target === root.querySelector('.backdrop')) close();
    });
    targetEl.addEventListener('input', function () { if (lastRows) render(lastRows); });

    // ------------------------------------------------------------------
    // Fetch + parse
    // ------------------------------------------------------------------
    function load() {
        bodyEl.innerHTML = '<div class="spin">Loading attendance&hellip;</div>';
        fetch(ATTENDANCE_URL, { credentials: 'same-origin', cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('The portal returned HTTP ' + res.status + '.');
                return res.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');

                // Bounced back to the login form => the AIS session has expired.
                if (doc.querySelector('form[action*="nextsislogin"], input[name="password"]')) {
                    return fail('Your AIS session has expired.',
                                'Log in at ais.tat.ac.in again, then re-open this panel.');
                }
                var rows = extractRows(doc);
                if (!rows.length) return reportStructure(doc);
                lastRows = rows;
                render(rows);
                syncedEl.textContent = 'Synced ' + new Date().toLocaleTimeString();
            })
            .catch(function (err) {
                fail('Could not read the attendance page.', err.message);
            });
    }

    // The exact table markup of attendancedetails.jsp is unknown, so score every
    // table by its header wording and use the best match rather than hardcoding.
    function extractRows(doc) {
        var best = null, bestScore = 0;

        Array.prototype.forEach.call(doc.querySelectorAll('table'), function (table) {
            var trs = table.rows;
            if (trs.length < 2) return;

            var head = cellsOf(trs[0]).map(lower);
            var score = 0;
            if (head.some(function (h) { return /subject|course|paper|sub\.?name/.test(h); })) score += 3;
            if (head.some(function (h) { return /held|conducted|delivered|total/.test(h); }))   score += 3;
            if (head.some(function (h) { return /attend|present/.test(h); }))                   score += 3;
            if (head.some(function (h) { return /%|percent/.test(h); }))                        score += 1;
            if (head.some(function (h) { return /code/.test(h); }))                             score += 1;

            if (score > bestScore) { bestScore = score; best = table; }
        });

        if (!best || bestScore < 6) return [];

        var header = cellsOf(best.rows[0]).map(lower);

        // Order matters: "Subject Code" and "Subject Name" both contain "subject",
        // and "Attendance %" contains "attend" - so match the specific wording
        // first and exclude the columns that would be false positives.
        var iSub  = findCol(header, [/subject\s*name|course\s*name|paper\s*name|sub\.?\s*name/,
                                     /subject|course|paper/],            /code|%|percent/);
        var iCode = findCol(header, [/subject\s*code|course\s*code|sub\.?\s*code|^code$/], null);
        var iHeld = findCol(header, [/class(es)?\s*held|held|conducted|delivered/,
                                     /total/],                           /%|percent|attend/);
        var iAtt  = findCol(header, [/class(es)?\s*attended|attended|present/], /%|percent/);
        if (iSub < 0 || iHeld < 0 || iAtt < 0) return [];

        var out = [];
        for (var r = 1; r < best.rows.length; r++) {
            var c = cellsOf(best.rows[r]);
            if (c.length <= Math.max(iSub, iHeld, iAtt)) continue;

            var subject  = c[iSub].trim();
            var held     = toInt(c[iHeld]);
            var attended = toInt(c[iAtt]);
            if (!subject || held === null || attended === null) continue;
            if (/^total/i.test(subject)) continue;              // skip the portal's own total row
            out.push({
                subject:  subject,
                code:     iCode >= 0 && c[iCode] ? c[iCode].trim() : '',
                held:     held,
                attended: attended
            });
        }
        return out;
    }

    function cellsOf(tr) { return Array.prototype.map.call(tr.cells, function (td) { return td.textContent; }); }
    function lower(s)    { return s.replace(/\s+/g, ' ').trim().toLowerCase(); }

    // Try each pattern in priority order; skip any column matching `exclude`.
    function findCol(head, patterns, exclude) {
        for (var p = 0; p < patterns.length; p++) {
            for (var i = 0; i < head.length; i++) {
                if (exclude && exclude.test(head[i])) continue;
                if (patterns[p].test(head[i])) return i;
            }
        }
        return -1;
    }
    function toInt(s) {
        var m = String(s).replace(/,/g, '').match(/\d+/);
        return m ? parseInt(m[0], 10) : null;
    }

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    function render(rows) {
        var target = Math.min(100, Math.max(1, parseInt(targetEl.value, 10) || DEFAULT_TARGET));
        var t = target / 100;

        var totHeld = 0, totAtt = 0;
        rows.forEach(function (r) { totHeld += r.held; totAtt += r.attended; });
        var overall = totHeld ? (totAtt / totHeld) * 100 : 0;

        var html =
            '<div class="summary">' +
              stat('Overall', totHeld ? overall.toFixed(2) + '%' : '\u2014') +
              stat('Attended', totAtt + ' / ' + totHeld) +
              stat('Subjects', String(rows.length)) +
            '</div>' +
            '<table><thead><tr>' +
              '<th>Subject</th><th>Attended</th><th>Held</th><th>%</th><th>What it means</th>' +
            '</tr></thead><tbody>';

        rows.forEach(function (r) {
            var pct = r.held ? (r.attended / r.held) * 100 : 0;
            var cls = pct >= target ? 'ok' : (pct >= target - 10 ? 'warn' : 'bad');
            var advice;

            if (r.held === 0) {
                advice = 'No classes held yet.';
            } else if (pct >= target) {
                // attended / (held + x) >= t   =>   x <= attended/t - held
                var canSkip = Math.floor(r.attended / t - r.held);
                advice = canSkip > 0
                    ? 'Can skip <b>' + canSkip + '</b> more'
                    : 'On the edge \u2014 skip none';
            } else {
                // (attended + x) / (held + x) >= t   =>   x >= (t*held - attended)/(1 - t)
                var need = Math.ceil((t * r.held - r.attended) / (1 - t));
                advice = 'Attend <b>' + need + '</b> in a row';
            }

            html += '<tr>' +
                '<td class="subject">' + esc(r.subject) +
                    (r.code ? '<span class="code">' + esc(r.code) + '</span>' : '') + '</td>' +
                '<td class="num">' + r.attended + '</td>' +
                '<td class="num">' + r.held + '</td>' +
                '<td class="num"><span class="pill ' + cls + '">' + pct.toFixed(1) + '%</span></td>' +
                '<td class="advice">' + advice + '</td>' +
            '</tr>';
        });

        bodyEl.innerHTML = html + '</tbody></table>';
    }

    function stat(k, v) { return '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>'; }
    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
        });
    }

    function fail(title, detail) {
        bodyEl.innerHTML = '<div class="note err"><b>' + esc(title) + '</b><br>' + esc(detail || '') + '</div>';
    }

    // If no table scored high enough, dump what the page actually contains so the
    // parser can be tuned in one pass instead of guessing.
    function reportStructure(doc) {
        var lines = [];
        Array.prototype.forEach.call(doc.querySelectorAll('table'), function (table, i) {
            if (table.rows.length < 2) return;
            lines.push('TABLE #' + i + '  (' + table.rows.length + ' rows)');
            lines.push('  header: ' + JSON.stringify(cellsOf(table.rows[0]).map(function (s) { return s.replace(/\s+/g, ' ').trim(); })));
            lines.push('  row1  : ' + JSON.stringify(cellsOf(table.rows[1]).map(function (s) { return s.replace(/\s+/g, ' ').trim(); })));
            lines.push('');
        });
        var report = lines.join('\n') || '(no tables with 2+ rows found on the page)';

        bodyEl.innerHTML =
            '<div class="note"><b>Attendance loaded, but the table layout was not recognised.</b><br>' +
            'The structure below shows what the page contains \u2014 send it over and the parser can be pointed at the right columns.</div>' +
            '<button id="copy" style="background:#fff;border:2px solid #141414;border-radius:4px;box-shadow:2px 2px 0 #141414;' +
            'font-weight:900;font-size:0.72rem;text-transform:uppercase;padding:6px 12px;cursor:pointer;">Copy report</button>' +
            '<pre>' + esc(report) + '</pre>';

        root.querySelector('#copy').addEventListener('click', function () {
            navigator.clipboard.writeText(report).then(function () {
                root.querySelector('#copy').textContent = 'Copied';
            });
        });
    }

    load();
})();

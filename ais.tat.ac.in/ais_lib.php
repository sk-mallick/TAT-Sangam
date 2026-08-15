<?php
// ============================================================
//  ais_lib.php — TAT AIS connector + HTML parsers
//  Pure library: defines things, runs nothing. Safe to include
//  from the endpoint or from a CLI test script.
//
//  CREDENTIAL POLICY
//  The AIS username/password are used in memory for one request
//  and are never written to the database, a file, a log or a
//  session. There is deliberately no "remember me" here.
// ============================================================

define('AIS_BASE',       'https://ais.tat.ac.in');
define('AIS_LOGIN_PAGE', AIS_BASE . '/ais/');
define('AIS_LOGIN_POST', AIS_BASE . '/ais/nextsislogin.jsp');
define('AIS_DASHBOARD',  '/ais/studsuclogin.jsp');
define('AIS_ATTENDANCE', '/ais/studportal/attendancedetails.jsp');
define('AIS_PROFILE',    '/ais/viewprofile.jsp');

class AisException extends Exception {}

// ============================================================
//  Persistent sign-in store
//
//  Staying signed in means the AIS password must be kept, which is a real
//  change from discarding it. It is handled as follows:
//
//    - encrypted with AES-256-GCM before it touches the disk;
//    - the key is generated per sign-in and stored ONLY in the browser
//      cookie, never on the server;
//    - the server file alone cannot be decrypted; the cookie alone points
//      at nothing.
//
//  Logging out deletes the file and expires the cookie.
// ============================================================

define('AIS_STORE_DIR', __DIR__ . '/_store');
define('AIS_COOKIE',    'tat_ais');
define('AIS_COOKIE_TTL', 60 * 60 * 24 * 30);      // 30 days

function ais_store_dir()
{
    if (!is_dir(AIS_STORE_DIR)) {
        @mkdir(AIS_STORE_DIR, 0700, true);
    }
    // Belt and braces: keep the store out of reach over HTTP.
    $ht = AIS_STORE_DIR . '/.htaccess';
    if (!file_exists($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\n Deny from all\n</IfModule>\n");
    }
    return AIS_STORE_DIR;
}

function ais_cookie_params()
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    // SCRIPT_NAME is the decoded path, and this project lives under a folder
    // with a space ("TAT SANGAM"). setcookie() rejects spaces outright, so
    // encode each segment back to its URL form.
    $dir  = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
    $path = rtrim($dir, '/') . '/';
    $path = implode('/', array_map('rawurlencode', explode('/', $path)));
    if ($path === '' || $path[0] !== '/') { $path = '/' . ltrim($path, '/'); }

    return ['path' => $path, 'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax'];
}

/** Encrypt $data, write it under a fresh token, and hand the key to the browser. */
function ais_store_save(array $data)
{
    ais_store_dir();
    $token = bin2hex(random_bytes(16));
    $key   = random_bytes(32);
    ais_store_write($token, $key, $data);

    $p = ais_cookie_params();
    setcookie(AIS_COOKIE, $token . '.' . rtrim(strtr(base64_encode($key), '+/', '-_'), '='), [
        'expires'  => time() + AIS_COOKIE_TTL,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],   // not readable from JavaScript
        'samesite' => $p['samesite'],
    ]);
    $_COOKIE[AIS_COOKIE] = $token . '.' . rtrim(strtr(base64_encode($key), '+/', '-_'), '=');
    return $token;
}

function ais_store_write($token, $key, array $data)
{
    $nonce = random_bytes(12);
    $tag   = '';
    $ct    = openssl_encrypt(json_encode($data), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag);
    if ($ct === false) { throw new AisException('Could not secure the stored sign-in.'); }
    $file = ais_store_dir() . '/' . $token . '.bin';
    if (file_put_contents($file, $nonce . $tag . $ct, LOCK_EX) === false) {
        throw new AisException('Could not write the stored sign-in.');
    }
    @chmod($file, 0600);
}

/** Returns ['token'=>, 'key'=>, 'data'=>] or null when not signed in. */
function ais_store_load()
{
    $raw = $_COOKIE[AIS_COOKIE] ?? '';
    if ($raw === '' || strpos($raw, '.') === false) { return null; }

    list($token, $k) = explode('.', $raw, 2);
    if (!preg_match('/^[a-f0-9]{32}$/', $token)) { return null; }   // reject path tricks
    $key = base64_decode(strtr($k, '-_', '+/'), true);
    if ($key === false || strlen($key) !== 32) { return null; }

    $file = ais_store_dir() . '/' . $token . '.bin';
    if (!is_file($file)) { return null; }
    $blob = file_get_contents($file);
    if ($blob === false || strlen($blob) < 29) { return null; }

    $plain = openssl_decrypt(
        substr($blob, 28), 'aes-256-gcm', $key, OPENSSL_RAW_DATA,
        substr($blob, 0, 12), substr($blob, 12, 16)
    );
    if ($plain === false) { return null; }                          // wrong key or tampered

    $data = json_decode($plain, true);
    return is_array($data) ? ['token' => $token, 'key' => $key, 'data' => $data] : null;
}

/** Update the stored blob in place (same token and key). */
function ais_store_update($token, $key, array $data) { ais_store_write($token, $key, $data); }

/** Delete the stored sign-in and expire the cookie. */
function ais_store_clear()
{
    $raw = $_COOKIE[AIS_COOKIE] ?? '';
    if ($raw !== '' && strpos($raw, '.') !== false) {
        list($token) = explode('.', $raw, 2);
        if (preg_match('/^[a-f0-9]{32}$/', $token)) {
            @unlink(ais_store_dir() . '/' . $token . '.bin');
        }
    }
    $p = ais_cookie_params();
    setcookie(AIS_COOKIE, '', [
        'expires'  => time() - 3600,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],
        'samesite' => $p['samesite'],
    ]);
    unset($_COOKIE[AIS_COOKIE]);
}

class AisConnector
{
    private $ch;
    private $jar;
    private $dashboardHtml = '';

    /** Dashboard body captured during login (carries the student's name). */
    public function dashboardHtml() { return $this->dashboardHtml; }

    public function __construct()
    {
        if (!function_exists('curl_init')) {
            throw new AisException('PHP cURL extension is not enabled.');
        }
        $this->jar = tempnam(sys_get_temp_dir(), 'ais_');
        $this->ch  = curl_init();
        curl_setopt_array($this->ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIEJAR      => $this->jar,   // JSESSIONID lives here
            CURLOPT_COOKIEFILE     => $this->jar,
            CURLOPT_FOLLOWLOCATION => true,         // login answers 302
            CURLOPT_MAXREDIRS      => 5,
            CURLOPT_TIMEOUT        => 25,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,         // never turn this off:
            CURLOPT_SSL_VERIFYHOST => 2,            // we forward a password over this link
            CURLOPT_ENCODING       => '',
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                                    . '(KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        ]);
    }

    /**
     * Authenticate. Returns true on success, throws AisException with a
     * distinguishable reason otherwise.
     */
    public function login($username, $password)
    {
        // 1. Touch the login page first so the servlet issues a JSESSIONID.
        //    POSTing cold can silently lose the session on JSP portals.
        curl_setopt($this->ch, CURLOPT_URL, AIS_LOGIN_PAGE);
        curl_setopt($this->ch, CURLOPT_HTTPGET, true);
        $first = curl_exec($this->ch);
        $this->assertTransport($first);
        $this->assertNotBlocked($first, (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE));

        // 2. Submit credentials. The live form has exactly two fields and no
        //    CSRF token (verified against the portal's own login page).
        curl_setopt_array($this->ch, [
            CURLOPT_URL        => AIS_LOGIN_POST,
            CURLOPT_POST       => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'username' => $username,
                'password' => $password,
            ]),
            CURLOPT_REFERER    => AIS_LOGIN_PAGE,
        ]);
        $body = curl_exec($this->ch);
        $this->assertTransport($body);

        $code  = (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE);
        $final = (string) curl_getinfo($this->ch, CURLINFO_EFFECTIVE_URL);
        $this->assertNotBlocked($body, $code);

        // 3. Success = we landed on the dashboard rather than bouncing back.
        if (strpos($final, AIS_DASHBOARD) !== false) {
            $this->dashboardHtml = (string) $body;
            return true;
        }
        if (ais_looks_like_login($body)) {
            throw new AisException('AIS rejected those credentials. Check the ID and password.');
        }
        throw new AisException('Unexpected response from AIS after login (HTTP ' . $code . ', landed on ' . $final . ').');
    }

    /** POST form fields to a path on the authenticated session. */
    public function post($path, array $fields, $referer = null)
    {
        curl_setopt_array($this->ch, [
            CURLOPT_URL        => AIS_BASE . $path,
            CURLOPT_POST       => true,
            CURLOPT_POSTFIELDS => http_build_query($fields),
            CURLOPT_REFERER    => $referer ? AIS_BASE . $referer : AIS_BASE . AIS_DASHBOARD,
        ]);
        $body = curl_exec($this->ch);
        $this->assertTransport($body);
        $this->assertNotBlocked($body, (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE));

        if (ais_looks_like_login($body)) {
            throw new AisException('The AIS session expired while submitting ' . $path . '.');
        }
        return $body;
    }

    /** GET a path on the authenticated session. */
    public function get($path)
    {
        curl_setopt_array($this->ch, [
            CURLOPT_URL     => AIS_BASE . $path,
            CURLOPT_HTTPGET => true,
            CURLOPT_POST    => false,
            CURLOPT_REFERER => AIS_BASE . AIS_DASHBOARD,
        ]);
        $body = curl_exec($this->ch);
        $this->assertTransport($body);
        $this->assertNotBlocked($body, (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE));

        if (ais_looks_like_login($body)) {
            throw new AisException('The AIS session expired while reading ' . $path . '.');
        }
        return $body;
    }

    private function assertTransport($body)
    {
        if ($body === false) {
            throw new AisException('Could not reach ais.tat.ac.in: ' . curl_error($this->ch));
        }
    }

    /**
     * Cloudflare sits in front of this portal with bot detection enabled.
     * If it starts challenging us, say so plainly rather than reporting it
     * as a wrong password — and do not attempt to work around the challenge.
     */
    private function assertNotBlocked($body, $code)
    {
        $blocked = in_array($code, [403, 429, 503], true)
            && preg_match('/cloudflare|cf-browser-verification|challenge-platform|Just a moment/i', (string) $body);

        if ($blocked) {
            throw new AisException(
                'Cloudflare blocked this request (HTTP ' . $code . '). Automated access is being challenged; '
                . 'use the in-browser panel instead, or ask TAT IT for approved API access.'
            );
        }
    }

    public function close()
    {
        if ($this->ch)  { curl_close($this->ch); $this->ch = null; }
        if ($this->jar) { @unlink($this->jar);   $this->jar = null; }   // drop the session cookie
    }

    public function __destruct() { $this->close(); }
}

// ------------------------------------------------------------
//  HTML helpers
// ------------------------------------------------------------

/** Did we get bounced back to the login form? */
function ais_looks_like_login($html)
{
    return (bool) preg_match('/nextsislogin\.jsp|name=["\']password["\']/i', (string) $html);
}

/**
 * Build a DOMXPath over legacy HTML. The portal is old JSP and may serve
 * windows-1252, so normalise to UTF-8 before parsing or accented names break.
 */
function ais_xpath($html)
{
    $charset = 'UTF-8';
    if (preg_match('/charset=["\']?\s*([\w-]+)/i', $html, $m)) {
        $charset = strtoupper($m[1]);
    }
    if ($charset !== 'UTF-8' && function_exists('mb_convert_encoding')) {
        $converted = @mb_convert_encoding($html, 'UTF-8', $charset);
        if ($converted !== false && $converted !== '') { $html = $converted; }
    }
    // Force the parser onto UTF-8 regardless of what the document claims.
    $html = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html;

    $doc = new DOMDocument();
    libxml_use_internal_errors(true);        // this markup will not be valid; expected
    $doc->loadHTML($html);
    libxml_clear_errors();
    return new DOMXPath($doc);
}

/**
 * Nearest ancestor of $node with one of $names, or null.
 * Ownership in this markup cannot be decided by parentage alone.
 */
function ais_closest($node, array $names)
{
    for ($p = $node->parentNode; $p && $p->nodeType === XML_ELEMENT_NODE; $p = $p->parentNode) {
        if (in_array(strtolower($p->nodeName), $names, true)) { return $p; }
    }
    return null;
}

/**
 * Cells belonging to THIS row.
 *
 * Two traps here, and they pull in opposite directions:
 *  - getElementsByTagName('td') grabs cells of nested tables too, flattening a
 *    whole inner table into one row;
 *  - direct children alone miss cells when AIS wraps rows in <form>.
 * Deciding by nearest ancestor <tr> satisfies both.
 */
function ais_cells($row)
{
    $xp  = new DOMXPath($row->ownerDocument);
    $out = [];
    foreach ($xp->query('.//td | .//th', $row) as $cell) {
        if (ais_closest($cell, ['tr']) === $row) { $out[] = ais_text($cell); }
    }
    return $out;
}

function ais_head_cells($row) { return ais_cells($row); }

/**
 * Rows belonging to THIS table, excluding rows of tables nested inside it.
 *
 * AIS wraps each attendance row in its own <form> posting to
 * viewstudentattendance.jsp. That is invalid HTML, so the parser reparents the
 * <tr> under the <form> and "./tr" finds only the header. Ownership is decided
 * by the nearest ancestor <table> instead, which is true through <form>,
 * <tbody> or any other interposed element.
 */
function ais_rows($table)
{
    $xp  = new DOMXPath($table->ownerDocument);
    $out = [];
    foreach ($xp->query('.//tr', $table) as $tr) {
        if (ais_closest($tr, ['table']) === $table) { $out[] = $tr; }
    }
    return $out;
}

function ais_text($node)
{
    return trim(preg_replace('/\s+/u', ' ', $node->textContent));
}

function ais_int($s)
{
    return preg_match('/\d+/', str_replace(',', '', (string) $s), $m) ? (int) $m[0] : null;
}

/**
 * Find a column by header wording. Patterns are tried in priority order and
 * any column matching $exclude is skipped — "Subject Code" vs "Subject Name",
 * and "Attendance %" vs "Attended", both need that.
 */
function ais_find_col(array $head, array $patterns, $exclude = null)
{
    foreach ($patterns as $re) {
        foreach ($head as $i => $h) {
            if ($exclude !== null && preg_match($exclude, $h)) { continue; }
            if (preg_match($re, $h)) { return $i; }
        }
    }
    return -1;
}

/**
 * The exact markup of attendancedetails.jsp is unknown, so score every table
 * by its header wording and use the best match instead of hardcoding a path.
 * Returns ['rows' => [...]] or ['rows' => [], 'tables' => <structure report>].
 */
function ais_parse_attendance($html)
{
    $xp     = ais_xpath($html);
    $tables = $xp->query('//table');
    $best = null; $bestScore = 0;

    foreach ($tables as $table) {
        $rows = ais_rows($table);
        if (count($rows) < 2) { continue; }

        $head = array_map('mb_strtolower', ais_head_cells($rows[0]));
        // A real data table has several header cells. Layout wrappers have one
        // or two containing the whole page, so reject those outright.
        if (count($head) < 3) { continue; }

        $score = 0;
        foreach ($head as $h) {
            if (preg_match('/subject|course|paper|sub\.?\s*name/', $h)) { $score += 3; break; }
        }
        foreach ($head as $h) {
            if (preg_match('/held|conducted|delivered|total/', $h))     { $score += 3; break; }
        }
        foreach ($head as $h) {
            if (preg_match('/attend|present/', $h))                     { $score += 3; break; }
        }
        if ($score > $bestScore) { $bestScore = $score; $best = $table; }
    }

    if (!$best || $bestScore < 9) {
        return ['rows' => [], 'tables' => ais_describe_tables($html)];
    }

    $rows = ais_rows($best);
    $head = array_map('mb_strtolower', ais_head_cells($rows[0]));

    $iSub  = ais_find_col($head, ['/subject\s*name|course\s*name|paper\s*name|sub\.?\s*name/',
                                  '/subject|course|paper/'],           '/code|%|percent/');
    $iCode = ais_find_col($head, ['/subject\s*code|course\s*code|sub\.?\s*code|^code$/']);
    $iHeld = ais_find_col($head, ['/class(es)?\s*held|held|conducted|delivered/', '/total/'],
                                                                       '/%|percent|attend/');
    $iAtt  = ais_find_col($head, ['/class(es)?\s*attended|attended|present/'], '/%|percent/');

    if ($iSub < 0 || $iHeld < 0 || $iAtt < 0) {
        return ['rows' => [], 'tables' => ais_describe_tables($html)];
    }

    $out = [];
    for ($r = 1, $n = count($rows); $r < $n; $r++) {
        $c = ais_cells($rows[$r]);
        if (count($c) <= max($iSub, $iHeld, $iAtt)) { continue; }

        $subject  = $c[$iSub];
        $held     = ais_int($c[$iHeld]);
        $attended = ais_int($c[$iAtt]);
        if ($subject === '' || $held === null || $attended === null) { continue; }
        if (preg_match('/^total/i', $subject)) { continue; }        // portal's own total row

        $out[] = [
            'subject'    => $subject,
            'code'       => ($iCode >= 0 && isset($c[$iCode])) ? $c[$iCode] : '',
            'held'       => $held,
            'attended'   => $attended,
            // computed here, never scraped — their displayed % is the least reliable field
            'percentage' => $held > 0 ? round($attended / $held * 100, 2) : 0.0,
        ];
    }
    return ['rows' => $out];
}

/**
 * Profile data is laid out as label/value pairs across a row, and AIS packs
 * TWO pairs into one row, e.g.
 *   ["Registration number", "2301289114", "Session:", "2026-2027"]
 * so walk each row in pairs rather than assuming exactly two cells.
 */
function ais_parse_profile($html)
{
    $xp = ais_xpath($html);

    // Anchor on the "Student Information" block. Without this, the attendance
    // table's own 6-cell rows also read as pairs ("Subject Name" => "Classes Held").
    // The heading must be that cell's whole text, not merely contained in it —
    // an outer wrapper cell also "contains" it via the nested tables inside.
    $scope = null;
    foreach ($xp->query('//table') as $table) {
        foreach (ais_rows($table) as $tr) {
            foreach (ais_cells($tr) as $cell) {
                if (mb_strlen($cell) <= 40 && preg_match('/^student\s+information\b/i', $cell)) {
                    $scope = $table;
                    break 3;
                }
            }
        }
    }

    $out = ais_pairs_from($scope ? ais_rows($scope) : []);
    if (count($out) < 2) {
        // No usable anchor: fall back to scanning the whole page.
        $out = ais_pairs_from(iterator_to_array($xp->query('//tr')));
    }
    return $out;
}

/** Walk rows in label/value pairs, keeping only plausible profile fields. */
function ais_pairs_from(array $rows)
{
    $out = [];
    foreach ($rows as $tr) {
        $c = ais_cells($tr);
        $n = count($c);
        if ($n < 2 || $n % 2 !== 0 || $n > 12) { continue; }

        for ($i = 0; $i < $n; $i += 2) {
            $label = trim(rtrim(trim($c[$i]), ":"));
            $value = trim($c[$i + 1]);
            if ($label === '' || $value === '') { continue; }
            if (mb_strlen($label) > 40 || mb_strlen($value) > 120) { continue; }
            if (!preg_match('/[A-Za-z]/', $label)) { continue; }
            // Nested layout tables repeat the whole menu inside one cell; skip those.
            if (preg_match('/\b(details|results)\b.*\b(details|results)\b/i', $label)) { continue; }
            // The semester <select> reads as "Select Semester" => "--- 1 2 3 ...".
            if (preg_match('/^select\b/i', $label) || preg_match('/^-{2,}/', $value)) { continue; }
            if (!isset($out[$label])) { $out[$label] = $value; }
        }
    }
    return $out;
}

/**
 * The dashboard greets the student with "Welcome , <NAME>" in the link to the
 * profile page. Verified against a real captured dashboard, so this is a
 * reliable name source even when viewprofile.jsp parses to nothing.
 */
function ais_parse_student_name($dashboardHtml)
{
    $xp = ais_xpath($dashboardHtml);
    foreach ($xp->query('//a[contains(@href, "viewprofile")]') as $a) {
        $t = ais_text($a);
        if (preg_match('/welcome\s*,?\s*(.+)$/i', $t, $m)) {
            $name = trim($m[1]);
            if ($name !== '') { return $name; }
        }
    }
    return '';
}

/**
 * attendancedetails.jsp does not carry the attendance table itself — it serves
 * a "Select Semester" form first. Find that form and everything needed to
 * replay it, so the semester can be submitted and the real table fetched.
 *
 * Returns null if no semester-style form is present.
 */
function ais_find_semester_form($html, $pagePath)
{
    $xp = ais_xpath($html);

    foreach ($xp->query('//form') as $form) {
        $selectName = null;
        $options    = [];

        foreach ($form->getElementsByTagName('select') as $sel) {
            $name = $sel->getAttribute('name');
            $opts = [];
            foreach ($sel->getElementsByTagName('option') as $o) {
                $v = $o->getAttribute('value');
                if ($v === '') { $v = ais_text($o); }
                $opts[] = $v;
            }
            // A semester picker: named like one, or offering plain 1..8 values.
            $numeric = array_values(array_filter($opts, function ($v) {
                return preg_match('/^\s*[1-8]\s*$/', $v);
            }));
            if (preg_match('/sem/i', $name) || count($numeric) >= 4) {
                $selectName = $name;
                $options    = $opts;
                break;
            }
        }
        if ($selectName === null) { continue; }

        // Replay every other field the form carries (hidden tokens included).
        $fields = [];
        foreach ($form->getElementsByTagName('input') as $in) {
            $n = $in->getAttribute('name');
            if ($n === '') { continue; }
            $type = strtolower($in->getAttribute('type'));
            if (in_array($type, ['button', 'reset'], true)) { continue; }
            if (in_array($type, ['checkbox', 'radio'], true) && !$in->hasAttribute('checked')) { continue; }
            $fields[$n] = $in->getAttribute('value');
        }
        foreach ($form->getElementsByTagName('select') as $sel) {
            $n = $sel->getAttribute('name');
            if ($n !== '' && $n !== $selectName) { $fields[$n] = ''; }
        }

        return [
            'action'     => ais_resolve_path($pagePath, $form->getAttribute('action')),
            'method'     => strtoupper($form->getAttribute('method') ?: 'GET') === 'POST' ? 'POST' : 'GET',
            'selectName' => $selectName,
            'options'    => $options,
            'fields'     => $fields,
        ];
    }
    return null;
}

/** Resolve a form action against the page it was found on. */
function ais_resolve_path($pagePath, $action)
{
    $action = trim($action);
    if ($action === '')            { return $pagePath; }
    if ($action[0] === '/')        { return $action; }
    if (preg_match('#^https?://#i', $action)) {
        $p = parse_url($action, PHP_URL_PATH);
        return $p ?: $pagePath;
    }
    return rtrim(dirname($pagePath), '/') . '/' . $action;
}

/** Debug aid: describe every form so an unrecognised flow can be diagnosed. */
function ais_describe_forms($html)
{
    $xp  = ais_xpath($html);
    $out = [];
    foreach ($xp->query('//form') as $i => $form) {
        $fields = [];
        foreach ($form->getElementsByTagName('input') as $in) {
            $fields[] = ($in->getAttribute('type') ?: 'text') . ':' . $in->getAttribute('name');
        }
        foreach ($form->getElementsByTagName('select') as $sel) {
            $opts = [];
            foreach ($sel->getElementsByTagName('option') as $o) {
                $opts[] = $o->getAttribute('value') !== '' ? $o->getAttribute('value') : ais_text($o);
            }
            $fields[] = 'select:' . $sel->getAttribute('name') . '=[' . implode('|', array_slice($opts, 0, 12)) . ']';
        }
        $out[] = [
            'form'   => $i,
            'action' => $form->getAttribute('action'),
            'method' => $form->getAttribute('method') ?: 'GET',
            'fields' => $fields,
        ];
    }
    return $out;
}

/** Fallback: describe every table so the parser can be tuned in one pass. */
function ais_describe_tables($html)
{
    $xp  = ais_xpath($html);
    $out = [];
    foreach ($xp->query('//table') as $i => $table) {
        $rows = ais_rows($table);              // own rows only, or wrappers dominate the report
        if (count($rows) < 2) { continue; }
        $out[] = [
            'table'  => $i,
            'rows'   => count($rows),
            'header' => ais_head_cells($rows[0]),
            'first'  => ais_cells($rows[1]),
        ];
    }

    // A blank report is worse than a noisy one - it hides the very thing being
    // diagnosed. If row ownership matched nothing, fall back to raw descendants.
    if (!$out) {
        foreach ($xp->query('//table') as $i => $table) {
            $rows = $table->getElementsByTagName('tr');
            if ($rows->length < 2) { continue; }
            $cells = function ($tr) {
                $a = [];
                foreach ($tr->getElementsByTagName('td') as $td) { $a[] = ais_text($td); }
                foreach ($tr->getElementsByTagName('th') as $th) { $a[] = ais_text($th); }
                return array_slice($a, 0, 12);
            };
            $out[] = [
                'table'  => $i,
                'rows'   => $rows->length,
                'header' => $cells($rows->item(0)),
                'first'  => $cells($rows->item(1)),
                'note'   => 'fallback: descendant rows',
            ];
        }
    }
    return $out;
}

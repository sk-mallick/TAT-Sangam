<?php
// ============================================================
//  profile_lib.php — TAT SANGAM Profile: AIS connector + parsers
//
//  Self-contained: this folder has no dependency on ../ais.tat.ac.in
//  or ../Project. Everything it needs lives here.
//
//  CREDENTIAL POLICY
//  Staying connected requires keeping the AIS password, so it is
//  encrypted with AES-256-GCM before touching disk and the key is
//  held only in the browser cookie. Disconnecting deletes both.
// ============================================================

define('PF_BASE',       'https://ais.tat.ac.in');
define('PF_LOGIN_PAGE', PF_BASE . '/ais/');
define('PF_LOGIN_POST', PF_BASE . '/ais/nextsislogin.jsp');
define('PF_DASHBOARD',  '/ais/studsuclogin.jsp');
define('PF_PROFILE',    '/ais/viewprofile.jsp');
define('PF_CAREER',     '/ais/studportal/careerdetails.jsp');
define('PF_HOSTEL',     '/ais/studportal/hostelandtransport.jsp');

define('PF_STORE_DIR',  __DIR__ . '/_store');
define('PF_COOKIE',     'tat_profile');          // distinct from the attendance page
define('PF_COOKIE_TTL', 60 * 60 * 24 * 30);      // 30 days

class PfException extends Exception {}

// ------------------------------------------------------------
//  Connector
// ------------------------------------------------------------
class PfConnector
{
    private $ch;
    private $jar;
    private $dashboardHtml = '';

    public function dashboardHtml() { return $this->dashboardHtml; }

    public function __construct()
    {
        if (!function_exists('curl_init')) {
            throw new PfException('PHP cURL extension is not enabled.');
        }
        $this->jar = tempnam(sys_get_temp_dir(), 'pf_');
        $this->ch  = curl_init();
        curl_setopt_array($this->ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIEJAR      => $this->jar,
            CURLOPT_COOKIEFILE     => $this->jar,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 5,
            CURLOPT_TIMEOUT        => 25,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,     // never disable: a password crosses this link
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_ENCODING       => '',
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                                    . '(KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        ]);
    }

    public function login($username, $password)
    {
        // Touch the login page first so the servlet issues a JSESSIONID.
        curl_setopt($this->ch, CURLOPT_URL, PF_LOGIN_PAGE);
        curl_setopt($this->ch, CURLOPT_HTTPGET, true);
        $first = curl_exec($this->ch);
        $this->assertTransport($first);
        $this->assertNotBlocked($first, (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE));

        curl_setopt_array($this->ch, [
            CURLOPT_URL        => PF_LOGIN_POST,
            CURLOPT_POST       => true,
            CURLOPT_POSTFIELDS => http_build_query(['username' => $username, 'password' => $password]),
            CURLOPT_REFERER    => PF_LOGIN_PAGE,
        ]);
        $body = curl_exec($this->ch);
        $this->assertTransport($body);

        $code  = (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE);
        $final = (string) curl_getinfo($this->ch, CURLINFO_EFFECTIVE_URL);
        $this->assertNotBlocked($body, $code);

        if (strpos($final, PF_DASHBOARD) !== false) {
            $this->dashboardHtml = (string) $body;
            return true;
        }
        if (pf_looks_like_login($body)) {
            throw new PfException('AIS rejected those credentials. Check the ID and password.');
        }
        throw new PfException('Unexpected response from AIS after login (HTTP ' . $code . ').');
    }

    public function get($path)
    {
        curl_setopt_array($this->ch, [
            CURLOPT_URL     => (strpos($path, 'http') === 0 ? $path : PF_BASE . $path),
            CURLOPT_HTTPGET => true,
            CURLOPT_POST    => false,
            CURLOPT_REFERER => PF_BASE . PF_DASHBOARD,
        ]);
        $body = curl_exec($this->ch);
        $this->assertTransport($body);
        $this->assertNotBlocked($body, (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE));

        if (pf_looks_like_login($body)) {
            throw new PfException('The AIS session expired while reading ' . $path . '.');
        }
        return $body;
    }

    /** Fetch a binary asset (the student photo) on the authenticated session. */
    public function getBinary($path)
    {
        curl_setopt_array($this->ch, [
            CURLOPT_URL     => (strpos($path, 'http') === 0 ? $path : PF_BASE . $path),
            CURLOPT_HTTPGET => true,
            CURLOPT_POST    => false,
            CURLOPT_REFERER => PF_BASE . PF_PROFILE,
        ]);
        $body = curl_exec($this->ch);
        if ($body === false) { return null; }
        $code = (int) curl_getinfo($this->ch, CURLINFO_RESPONSE_CODE);
        $type = (string) curl_getinfo($this->ch, CURLINFO_CONTENT_TYPE);
        if ($code !== 200 || stripos($type, 'image/') !== 0 || strlen($body) < 256) {
            return null;
        }
        return ['mime' => strtok($type, ';'), 'bytes' => $body];
    }

    private function assertTransport($body)
    {
        if ($body === false) {
            throw new PfException('Could not reach ais.tat.ac.in: ' . curl_error($this->ch));
        }
    }

    // Cloudflare fronts this portal. Report a challenge honestly rather than
    // as a wrong password, and never attempt to work around it.
    private function assertNotBlocked($body, $code)
    {
        if (in_array($code, [403, 429, 503], true)
            && preg_match('/cloudflare|cf-browser-verification|challenge-platform|Just a moment/i', (string) $body)) {
            throw new PfException(
                'Cloudflare blocked this request (HTTP ' . $code . '). Automated access is being '
                . 'challenged — try again later or ask TAT IT for approved access.'
            );
        }
    }

    public function close()
    {
        if ($this->ch)  { curl_close($this->ch); $this->ch = null; }
        if ($this->jar) { @unlink($this->jar);   $this->jar = null; }
    }
    public function __destruct() { $this->close(); }
}

// ------------------------------------------------------------
//  HTML helpers
// ------------------------------------------------------------

function pf_looks_like_login($html)
{
    return (bool) preg_match('/nextsislogin\.jsp|name=["\']password["\']/i', (string) $html);
}

/**
 * Cloudflare hides e-mail addresses behind
 *   <a class="__cf_email__" data-cfemail="HEX">[email&nbsp;protected]</a>
 * and decodes them with JavaScript in the browser. We fetch server-side, so
 * that script never runs and the placeholder is all we would ever store.
 *
 * The encoding is trivial: the first hex byte is an XOR key, every following
 * byte is a character of the address XORed with it.
 */
function pf_decode_cfemail($hex)
{
    if (!preg_match('/^[0-9a-f]+$/i', $hex) || strlen($hex) < 4 || strlen($hex) % 2 !== 0) { return ''; }
    $key = hexdec(substr($hex, 0, 2));
    $out = '';
    for ($i = 2; $i < strlen($hex); $i += 2) {
        $out .= chr(hexdec(substr($hex, $i, 2)) ^ $key);
    }
    return preg_match('/^[\x20-\x7E]+$/', $out) ? $out : '';
}

/**
 * Replace every Cloudflare-protected e-mail with the real address.
 *
 * Cloudflare uses two different forms and both appear in the wild:
 *   1. <a|span … data-cfemail="HEX">[email protected]</a>
 *   2. <a href="/cdn-cgi/l/email-protection#HEX">[email protected]</a>
 *      — used when the original markup was a mailto: link, with no
 *        data-cfemail attribute at all.
 */
function pf_reveal_emails($html, &$found = null)
{
    $found = 0;
    $swap = function ($hex, $original) use (&$found) {
        $mail = pf_decode_cfemail($hex);
        if ($mail === '') { return $original; }
        $found++;
        return htmlspecialchars($mail, ENT_QUOTES, 'UTF-8');
    };

    // 1. any element carrying data-cfemail (backreference closes the right tag)
    $html = preg_replace_callback(
        '#<(\w+)\b[^>]*\sdata-cfemail="([0-9a-fA-F]+)"[^>]*>.*?</\1\s*>#is',
        function ($m) use ($swap) { return $swap($m[2], $m[0]); },
        $html
    );

    // 2. anchors whose href carries the hex in the fragment
    $html = preg_replace_callback(
        '#<a\b[^>]*href="[^"]*email-protection\#([0-9a-fA-F]+)"[^>]*>.*?</a\s*>#is',
        function ($m) use ($swap) { return $swap($m[1], $m[0]); },
        $html
    );

    // 3. bare self-closing/unclosed element carrying the attribute
    $html = preg_replace_callback(
        '#<\w+\b[^>]*\sdata-cfemail="([0-9a-fA-F]+)"[^>]*/?>#i',
        function ($m) use ($swap) { return $swap($m[1], $m[0]); },
        $html
    );

    return $html;
}

/** Encoding-safe DOMXPath. This portal may serve windows-1252. */
function pf_xpath($html)
{
    $charset = 'UTF-8';
    if (preg_match('/charset=["\']?\s*([\w-]+)/i', $html, $m)) { $charset = strtoupper($m[1]); }
    if ($charset !== 'UTF-8' && function_exists('mb_convert_encoding')) {
        $c = @mb_convert_encoding($html, 'UTF-8', $charset);
        if ($c !== false && $c !== '') { $html = $c; }
    }

    $html = pf_reveal_emails($html);

    // <br> separates address lines. Without this they concatenate into
    // "PHASE-IICHANDRASEKHAR PUR".
    $html = preg_replace('#<br\s*/?>#i', ', ', $html);

    $html = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html;

    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML($html);
    libxml_clear_errors();
    return new DOMXPath($doc);
}

function pf_text($node)
{
    $t = trim(preg_replace('/\s+/u', ' ', $node->textContent));
    // tidy the separators introduced for <br>
    $t = preg_replace('/\s+,/', ',', $t);
    $t = preg_replace('/,\s*,+/', ',', $t);
    return trim($t, " ,");
}

/** Nearest ancestor with one of $names. */
function pf_closest($node, array $names)
{
    for ($p = $node->parentNode; $p && $p->nodeType === XML_ELEMENT_NODE; $p = $p->parentNode) {
        if (in_array(strtolower($p->nodeName), $names, true)) { return $p; }
    }
    return null;
}

/**
 * Cells of THIS row only. AIS nests tables deeply and also wraps rows in
 * <form>, so ownership is decided by nearest ancestor <tr>, not by parentage.
 */
function pf_cells($row)
{
    $xp  = new DOMXPath($row->ownerDocument);
    $out = [];
    foreach ($xp->query('.//td | .//th', $row) as $cell) {
        if (pf_closest($cell, ['tr']) === $row) { $out[] = pf_text($cell); }
    }
    return $out;
}

/** Rows of THIS table only, true through <form> / <tbody> wrappers. */
function pf_rows($table)
{
    $xp  = new DOMXPath($table->ownerDocument);
    $out = [];
    foreach ($xp->query('.//tr', $table) as $tr) {
        if (pf_closest($tr, ['table']) === $table) { $out[] = $tr; }
    }
    return $out;
}

/**
 * Walk rows in label/value pairs. AIS packs TWO pairs per row, e.g.
 *   ["Registration number", "2301289114", "Session:", "2026-2027"]
 */
function pf_pairs_from(array $rows)
{
    $out = [];
    foreach ($rows as $tr) {
        $c = pf_cells($tr);
        $n = count($c);
        if ($n < 2 || $n % 2 !== 0 || $n > 12) { continue; }

        for ($i = 0; $i < $n; $i += 2) {
            $label = trim(rtrim(trim($c[$i]), ":"));
            $value = trim($c[$i + 1]);
            if ($label === '' || $value === '') { continue; }
            if (mb_strlen($label) > 46 || mb_strlen($value) > 160) { continue; }
            if (!preg_match('/[A-Za-z]/', $label)) { continue; }
            // Nested layout cells repeat the whole menu; skip those.
            if (preg_match('/\b(details|results)\b.*\b(details|results)\b/i', $label)) { continue; }
            if (preg_match('/^select\b/i', $label) || preg_match('/^-{2,}/', $value)) { continue; }
            if (!isset($out[$label])) { $out[$label] = $value; }
        }
    }
    return $out;
}

/**
 * Split a page into its panels.
 *
 * AIS pages are a run of single-cell heading rows ("College Information",
 * "Parents Personal Information", "Hostel & Transport") each followed by
 * label/value rows. Tracking the current heading is what lets us keep BOTH
 * "Phone" values — the student's and the guardian's — instead of the first
 * one silently winning.
 *
 * Returns ['Panel name' => ['Label' => 'Value', …], …]
 */
function pf_parse_panels($html)
{
    $xp      = pf_xpath($html);
    $panels  = [];
    $current = 'General';

    foreach ($xp->query('//tr') as $tr) {
        $c = pf_cells($tr);
        $n = count($c);

        // A panel heading: one short cell naming a section.
        if ($n === 1 && mb_strlen($c[0]) <= 60
            && preg_match('/\b(information|details|transport|facilit)/i', $c[0])) {
            $current = trim($c[0]);
            continue;
        }
        if ($n < 2 || $n % 2 !== 0 || $n > 12) { continue; }

        for ($i = 0; $i < $n; $i += 2) {
            $label = trim(rtrim(trim($c[$i]), ':'));
            $value = trim($c[$i + 1]);
            if ($label === '' || $value === '') { continue; }
            if (mb_strlen($label) > 46 || mb_strlen($value) > 160) { continue; }
            if (!preg_match('/[A-Za-z]/', $label)) { continue; }
            if (preg_match('/\b(details|results)\b.*\b(details|results)\b/i', $label)) { continue; }
            if (preg_match('/^select\b/i', $label) || preg_match('/^-{2,}/', $value)) { continue; }

            if (!isset($panels[$current][$label])) { $panels[$current][$label] = $value; }
        }
    }
    return $panels;
}

/** Short qualifier used when two panels carry the same label. */
function pf_qualify($panel)
{
    if (preg_match('/parent|guardian/i', $panel))   { return 'Guardian'; }
    if (preg_match('/college/i', $panel))           { return 'College'; }
    if (preg_match('/hostel|transport/i', $panel))  { return 'Hostel'; }
    $w = preg_split('/\s+/', trim($panel));
    return $w[0] !== '' ? $w[0] : 'Other';
}

/**
 * Profile fields, flattened across panels. A label that appears in two panels
 * with different values is kept twice, the second qualified by its panel —
 * so the parents' "Phone" becomes "Guardian Phone" rather than being dropped.
 */
function pf_parse_profile($html)
{
    $panels = pf_parse_panels($html);
    $out    = [];

    foreach ($panels as $panel => $fields) {
        foreach ($fields as $label => $value) {
            $key = $label;
            if (isset($out[$key]) && $out[$key] !== $value) {
                $key = pf_qualify($panel) . ' ' . $label;
            }
            if (!isset($out[$key])) { $out[$key] = $value; }
        }
    }

    if (count($out) < 3) {
        $out = pf_pairs_from(iterator_to_array(pf_xpath($html)->query('//tr')));
    }
    return $out;
}

/** Hostel / transport availing flags from hostelandtransport.jsp. */
function pf_parse_facilities($html)
{
    foreach (pf_parse_panels($html) as $name => $fields) {
        if (preg_match('/hostel|transport|facilit/i', $name)) { return $fields; }
    }
    return [];
}

/**
 * Career details. The page layout is unknown, so return BOTH shapes:
 *  - 'fields'  : label/value pairs found anywhere
 *  - 'tables'  : any real data table, as header + rows
 */
function pf_parse_career($html)
{
    $xp = pf_xpath($html);

    // ── 1. Real data tables (e.g. the SGPA grid) ───────────────
    $tables    = [];
    $dataNodes = [];
    foreach ($xp->query('//table') as $table) {
        $rows = pf_rows($table);
        if (count($rows) < 2) { continue; }

        $head = pf_cells($rows[0]);
        if (count($head) < 2) { continue; }
        $longCell = false;
        foreach ($head as $h) { if (mb_strlen($h) > 60) { $longCell = true; break; } }
        if ($longCell) { continue; }

        // A label/value block also has a "first row", but it already contains
        // values ("Registration number", "2301289114", …). Only treat this as a
        // data table when the first row is labels all the way across.
        if (!pf_looks_like_header($head)) { continue; }

        $body = [];
        for ($i = 1, $n = count($rows); $i < $n; $i++) {
            $c = pf_cells($rows[$i]);
            if (count($c) !== count($head)) { continue; }
            if (implode('', $c) === '') { continue; }
            $body[] = $c;
        }
        if (!$body) { continue; }

        $tables[]    = ['header' => $head, 'rows' => $body];
        $dataNodes[] = $table;
    }

    // ── 2. Label/value pairs, EXCLUDING rows of those tables ───
    // Without this the SGPA header row is read in pairs and produces junk
    // like "SGPA-1 => SGPA-2" and "CGPA => BACK LOGS".
    $rows = [];
    foreach ($xp->query('//tr') as $tr) {
        $owner = pf_closest($tr, ['table']);
        if ($owner && in_array($owner, $dataNodes, true)) { continue; }
        $rows[] = $tr;
    }
    $fields = pf_pairs_from($rows);

    // Drop placeholder-only pairs.
    foreach ($fields as $k => $v) {
        if (preg_match('/^(n\/?a|-{1,}|nil|null)$/i', trim($v))) { unset($fields[$k]); }
    }

    return ['fields' => $fields, 'tables' => $tables];
}

/**
 * True when every non-empty cell reads like a column heading rather than a
 * value: it contains a letter and is not a bare number or date.
 */
function pf_looks_like_header(array $cells)
{
    if (count($cells) < 2) { return false; }
    foreach ($cells as $c) {
        $c = trim($c);
        if ($c === '') { continue; }
        if (!preg_match('/[A-Za-z]/', $c)) { return false; }            // 2301289114, 2026-2027
        if (preg_match('#^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$#', $c)) { return false; }
    }
    return true;
}

/** The dashboard greets with "Welcome , <NAME>" in the profile link. */
function pf_parse_student_name($dashboardHtml)
{
    $xp = pf_xpath($dashboardHtml);
    foreach ($xp->query('//a[contains(@href, "viewprofile")]') as $a) {
        $t = pf_text($a);
        if (preg_match('/welcome\s*,?\s*(.+)$/i', $t, $m)) {
            $name = trim($m[1]);
            if ($name !== '') { return $name; }
        }
    }
    return '';
}

/**
 * Locate the student photo. Scores every <img> — a real photo tends to live in
 * a servlet/JSP that takes the registration number, or has photo-ish wording.
 * Returns the best candidate src, or '' if none looks plausible.
 */
function pf_find_photo_src($html)
{
    // AIS serves student photos from /ais/Staff/<registration>.jpg. Match that
    // first: the tag is malformed (height="150"") and scores nothing on wording,
    // so the generic heuristic below would miss it entirely.
    if (preg_match('#["\'](/?(?:ais/)?Staff/\d+\.(?:jpe?g|png))["\']#i', $html, $m)) {
        return $m[1][0] === '/' ? $m[1] : '/' . $m[1];
    }

    $xp   = pf_xpath($html);
    $best = ''; $bestScore = 0;

    foreach ($xp->query('//img') as $img) {
        $src = trim($img->getAttribute('src'));
        if ($src === '') { continue; }
        $hay = strtolower($src . ' ' . $img->getAttribute('alt') . ' ' . $img->getAttribute('id')
                              . ' ' . $img->getAttribute('name') . ' ' . $img->getAttribute('class'));

        $score = 0;
        if (preg_match('/photo|image|picture|dp\b|stud|profile|passport/', $hay)) { $score += 4; }
        if (preg_match('/\.(jsp|do|servlet)\b|\?/', $src))                        { $score += 2; }
        if (preg_match('/regd|regno|rollno|id=/i', $src))                         { $score += 3; }
        // Obvious page furniture.
        if (preg_match('/logo|banner|header|footer|icon|arrow|bullet|line|bg|spacer|loading|remove/', $hay)) {
            $score -= 6;
        }
        if (preg_match('/\.(gif)$/', $hay)) { $score -= 2; }

        if ($score > $bestScore) { $bestScore = $score; $best = $src; }
    }
    return $bestScore >= 4 ? $best : '';
}

/** Resolve a possibly-relative src against the page it was found on. */
function pf_resolve_path($pagePath, $src)
{
    $src = trim($src);
    if ($src === '') { return ''; }
    if (preg_match('#^https?://#i', $src)) { return $src; }
    if ($src[0] === '/') { return $src; }
    return rtrim(dirname($pagePath), '/') . '/' . $src;
}

/** Debug aid: list every table so an unknown layout can be diagnosed. */
function pf_describe_tables($html)
{
    $xp  = pf_xpath($html);
    $out = [];
    foreach ($xp->query('//table') as $i => $table) {
        $rows = pf_rows($table);
        if (count($rows) < 2) { continue; }
        $out[] = [
            'table'  => $i,
            'rows'   => count($rows),
            'header' => array_slice(pf_cells($rows[0]), 0, 12),
            'first'  => array_slice(pf_cells($rows[1]), 0, 12),
        ];
    }
    return $out;
}

// ============================================================
//  Encrypted connection store
// ============================================================

function pf_store_dir()
{
    if (!is_dir(PF_STORE_DIR)) { @mkdir(PF_STORE_DIR, 0700, true); }
    $ht = PF_STORE_DIR . '/.htaccess';
    if (!file_exists($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\n Deny from all\n</IfModule>\n");
    }
    return PF_STORE_DIR;
}

function pf_cookie_params()
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    // This project lives under a folder containing a space ("TAT SANGAM").
    // setcookie() rejects spaces in a path, so encode each segment.
    $dir  = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
    $path = rtrim($dir, '/') . '/';
    $path = implode('/', array_map('rawurlencode', explode('/', $path)));
    if ($path === '' || $path[0] !== '/') { $path = '/' . ltrim($path, '/'); }
    return ['path' => $path, 'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax'];
}

function pf_store_save(array $data)
{
    pf_store_dir();
    $token = bin2hex(random_bytes(16));
    $key   = random_bytes(32);
    pf_store_write($token, $key, $data);

    $p      = pf_cookie_params();
    $cookie = $token . '.' . rtrim(strtr(base64_encode($key), '+/', '-_'), '=');
    setcookie(PF_COOKIE, $cookie, [
        'expires'  => time() + PF_COOKIE_TTL,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],
        'samesite' => $p['samesite'],
    ]);
    $_COOKIE[PF_COOKIE] = $cookie;
    return $token;
}

function pf_store_write($token, $key, array $data)
{
    $nonce = random_bytes(12);
    $tag   = '';
    $ct    = openssl_encrypt(json_encode($data), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag);
    if ($ct === false) { throw new PfException('Could not secure the stored connection.'); }
    $file = pf_store_dir() . '/' . $token . '.bin';
    if (file_put_contents($file, $nonce . $tag . $ct, LOCK_EX) === false) {
        throw new PfException('Could not write the stored connection.');
    }
    @chmod($file, 0600);
}

function pf_store_load()
{
    $raw = $_COOKIE[PF_COOKIE] ?? '';
    if ($raw === '' || strpos($raw, '.') === false) { return null; }

    list($token, $k) = explode('.', $raw, 2);
    if (!preg_match('/^[a-f0-9]{32}$/', $token)) { return null; }   // reject path tricks
    $key = base64_decode(strtr($k, '-_', '+/'), true);
    if ($key === false || strlen($key) !== 32) { return null; }

    $file = pf_store_dir() . '/' . $token . '.bin';
    if (!is_file($file)) { return null; }
    $blob = file_get_contents($file);
    if ($blob === false || strlen($blob) < 29) { return null; }

    $plain = openssl_decrypt(
        substr($blob, 28), 'aes-256-gcm', $key, OPENSSL_RAW_DATA,
        substr($blob, 0, 12), substr($blob, 12, 16)
    );
    if ($plain === false) { return null; }

    $data = json_decode($plain, true);
    return is_array($data) ? ['token' => $token, 'key' => $key, 'data' => $data] : null;
}

function pf_store_update($token, $key, array $data) { pf_store_write($token, $key, $data); }

function pf_store_clear()
{
    $raw = $_COOKIE[PF_COOKIE] ?? '';
    if ($raw !== '' && strpos($raw, '.') !== false) {
        list($token) = explode('.', $raw, 2);
        if (preg_match('/^[a-f0-9]{32}$/', $token)) {
            @unlink(pf_store_dir() . '/' . $token . '.bin');
        }
    }
    $p = pf_cookie_params();
    setcookie(PF_COOKIE, '', [
        'expires'  => time() - 3600,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],
        'samesite' => $p['samesite'],
    ]);
    unset($_COOKIE[PF_COOKIE]);
}

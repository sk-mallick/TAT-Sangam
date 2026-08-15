<?php
// ============================================================
//  profile.php — TAT SANGAM Profile endpoint
//
//  POST action=connect   ais_user, ais_pass   -> sign in, fetch, remember
//  POST action=refresh                        -> re-fetch using stored sign-in
//  POST action=status                         -> connected? plus cached data
//  POST action=disconnect                     -> forget everything
//
//  Reads BOTH /ais/viewprofile.jsp and /ais/studportal/careerdetails.jsp,
//  plus the student photo (returned inline as a data URI so the browser
//  needs no AIS session of its own).
// ============================================================

ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

require_once __DIR__ . '/profile_lib.php';

function out($success, $message = '', $extra = [])
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

set_exception_handler(function ($e) {
    http_response_code(500);
    $msg = ($e instanceof PfException) ? $e->getMessage() : 'Server error while contacting AIS.';
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
});

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    out(false, 'POST only.');
}

$action = $_POST['action'] ?? 'status';

// ── disconnect ──────────────────────────────────────────────
if ($action === 'disconnect') {
    pf_store_clear();
    out(true, 'Disconnected from Trident AIS.', ['connected' => false]);
}

// ── status ──────────────────────────────────────────────────
if ($action === 'status') {
    $store = pf_store_load();
    if (!$store) { out(true, 'Not connected.', ['connected' => false]); }

    $d = $store['data'];
    out(true, 'Connected.', [
        'connected' => true,
        'aisUser'   => $d['u']       ?? '',
        'profile'   => $d['profile'] ?? [],
        'career'     => $d['career']     ?? ['fields' => [], 'tables' => []],
        'facilities' => $d['facilities'] ?? [],
        'photo'     => $d['photo']   ?? '',
        'fetchedAt' => $d['fetchedAt'] ?? null,
    ]);
}

if ($action !== 'connect' && $action !== 'refresh') {
    out(false, 'Unknown action.');
}

// ── credentials: fresh for connect, stored for refresh ──────
$store = null;
if ($action === 'connect') {
    $user = trim($_POST['ais_user'] ?? '');
    $pass = $_POST['ais_pass'] ?? '';
    if ($user === '' || $pass === '') { out(false, 'Enter your AIS ID and password.'); }
} else {
    $store = pf_store_load();
    if (!$store) { out(false, 'Not connected.', ['connected' => false]); }
    $user = $store['data']['u'] ?? '';
    $pass = $store['data']['p'] ?? '';
    if ($user === '' || $pass === '') {
        pf_store_clear();
        out(false, 'Stored connection was unreadable. Please connect again.', ['connected' => false]);
    }
}

$ais = new PfConnector();
try {
    $ais->login($user, $pass);

    // ── viewprofile.jsp ─────────────────────────────────────
    $profileHtml = $ais->get(PF_PROFILE);
    $profile     = pf_parse_profile($profileHtml);

    // Diagnostic: did the page carry Cloudflare-protected e-mails, and did we
    // decode them? Distinguishes "not decoded" from "not present at all".
    $cfFound = 0;
    pf_reveal_emails($profileHtml, $cfFound);
    $emailDebug = [
        'cfDecoded'        => $cfFound,
        'hasCfMarkup'      => (int) preg_match('/data-cfemail|email-protection/i', $profileHtml),
        'placeholderLeft'  => (int) preg_match('/\[email\s*(&#160;|&nbsp;|\s)*protected\]/i', json_encode($profile)),
    ];

    $name = pf_parse_student_name($ais->dashboardHtml());
    if ($name !== '' && !isset($profile['Name'])) {
        $profile = array_merge(['Name' => $name], $profile);
    }

    // ── student photo, inlined as a data URI ────────────────
    $photo    = '';
    $photoSrc = pf_find_photo_src($profileHtml);
    if ($photoSrc !== '') {
        $img = $ais->getBinary(pf_resolve_path(PF_PROFILE, $photoSrc));
        if ($img && strlen($img['bytes']) <= 3 * 1024 * 1024) {          // keep the blob sane
            $photo = 'data:' . $img['mime'] . ';base64,' . base64_encode($img['bytes']);
        }
    }

    // ── careerdetails.jsp (layout unknown; never fatal) ─────
    $career = ['fields' => [], 'tables' => []];
    $careerDebug = [];
    try {
        $careerHtml = $ais->get(PF_CAREER);
        $career     = pf_parse_career($careerHtml);
        if (!$career['fields'] && !$career['tables']) {
            $careerDebug = pf_describe_tables($careerHtml);
        }
    } catch (PfException $e) {
        // A missing career page must not sink the whole profile.
        $career = ['fields' => [], 'tables' => [], 'error' => $e->getMessage()];
    }

    // ── hostel & transport ──────────────────────────────────
    // Registration number lives on the career page, not the profile page.
    $regd = $career['fields']['Registration number']
         ?? ($profile['Registration number'] ?? '');
    $facilities  = [];
    $hostelDebug = [];
    $hostelTried = [];

    // The browser requests this page with ?regdnum=…; try that first, then the
    // bare URL in case the servlet reads it from the session. Each attempt is
    // caught on its own so one failure does not skip the other.
    $tries = $regd !== ''
        ? [PF_HOSTEL . '?regdnum=' . rawurlencode($regd), PF_HOSTEL]
        : [PF_HOSTEL, PF_HOSTEL . '?regdnum=' . rawurlencode((string) $user)];

    foreach ($tries as $url) {
        try {
            $html       = $ais->get($url);
            $facilities = pf_parse_facilities($html);
            $hostelTried[] = ['url' => $url, 'bytes' => strlen($html), 'parsed' => count($facilities)];
            if ($facilities) { break; }
            $hostelDebug = pf_describe_tables($html);
        } catch (PfException $e) {
            // Record why rather than silently returning nothing.
            $hostelTried[] = ['url' => $url, 'error' => $e->getMessage()];
        }
    }

    $ais->close();

    if (!$profile) {
        out(false, 'Connected, but no profile fields were recognised.', [
            'connected' => true,
            'tables'    => pf_describe_tables($profileHtml),
            'photo'     => $photo,
        ]);
    }

    $fetchedAt = date('c');
    $payload   = [
        'u'         => $user,
        'p'         => $pass,
        'profile'   => $profile,
        'career'     => $career,
        'facilities' => $facilities,
        'photo'      => $photo,
        'fetchedAt'  => $fetchedAt,
    ];

    // Only persist once AIS has actually accepted the credentials.
    if ($action === 'connect') {
        pf_store_save($payload);
    } else {
        pf_store_update($store['token'], $store['key'], $payload);
    }
    unset($pass, $payload['p'], $_POST['ais_pass']);

    out(true, 'Profile loaded from Trident AIS.', [
        'connected'   => true,
        'aisUser'     => $user,
        'profile'     => $profile,
        'career'      => $career,
        'facilities'  => $facilities,
        'photo'       => $photo,
        'careerDebug' => $careerDebug,
        'hostelDebug' => $facilities ? [] : $hostelDebug,
        'hostelTried' => $hostelTried,
        'emailDebug'  => $emailDebug,
        'fetchedAt'   => $fetchedAt,
    ]);

} catch (PfException $e) {
    $ais->close();
    // A stored password AIS now rejects (changed password) must not loop.
    $stale = ($action === 'refresh' && stripos($e->getMessage(), 'rejected those credentials') !== false);
    if ($stale) { pf_store_clear(); }
    out(false, $e->getMessage(), ['connected' => $stale ? false : ($action === 'refresh')]);
}

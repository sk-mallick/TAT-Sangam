<?php
// ============================================================
//  ais.php — TAT SANGAM endpoint for AIS attendance + profile
//
//  POST action=login   ais_user, ais_pass, [semester]  -> sign in and remember
//  POST action=fetch   [semester]                      -> refresh using stored sign-in
//  POST action=status                                  -> signed in? plus cached data
//  POST action=logout                                  -> forget everything
//
//  Staying signed in requires keeping the password. It is stored encrypted
//  (AES-256-GCM) with the key held only in the browser cookie — see the store
//  section of ais_lib.php. Logging out deletes it.
// ============================================================

ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

require_once __DIR__ . '/ais_lib.php';

function out($success, $message = '', $extra = [])
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

set_exception_handler(function ($e) {
    http_response_code(500);
    $msg = ($e instanceof AisException) ? $e->getMessage() : 'Server error while contacting AIS.';
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
});

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    out(false, 'POST only.');
}

$action = $_POST['action'] ?? 'status';

// ── logout ──────────────────────────────────────────────────
if ($action === 'logout') {
    ais_store_clear();
    out(true, 'Signed out of AIS.', ['loggedIn' => false]);
}

// ── status: report sign-in and hand back the cached result ──
if ($action === 'status') {
    $store = ais_store_load();
    if (!$store) { out(true, 'Not signed in.', ['loggedIn' => false]); }

    $d = $store['data'];
    out(true, 'Signed in.', [
        'loggedIn'     => true,
        'aisUser'      => $d['u'] ?? '',
        'profile'      => $d['profile']    ?? [],
        'attendance'   => $d['attendance'] ?? [],
        'semesters'    => $d['semesters']  ?? [],   // the list AIS actually offers
        'usedSemester' => $d['semester']   ?? null,
        'fetchedAt'    => $d['fetchedAt']  ?? null,
    ]);
}

if ($action !== 'login' && $action !== 'fetch') {
    out(false, 'Unknown action.');
}

// ── resolve credentials: fresh for login, stored for fetch ──
$store   = null;
$wantSem = trim($_POST['semester'] ?? '');

if ($action === 'login') {
    $user = trim($_POST['ais_user'] ?? '');
    $pass = $_POST['ais_pass'] ?? '';
    if ($user === '' || $pass === '') { out(false, 'Enter your AIS ID and password.'); }
} else {
    $store = ais_store_load();
    if (!$store) { out(false, 'Not signed in.', ['loggedIn' => false]); }
    $user = $store['data']['u'] ?? '';
    $pass = $store['data']['p'] ?? '';
    if ($user === '' || $pass === '') {
        ais_store_clear();
        out(false, 'Stored sign-in was unreadable. Please sign in again.', ['loggedIn' => false]);
    }
    if ($wantSem === '') { $wantSem = (string) ($store['data']['semester'] ?? ''); }
}

$ais = new AisConnector();
try {
    $ais->login($user, $pass);

    $page       = $ais->get(AIS_ATTENDANCE);
    $profile    = ais_parse_profile($page);
    $name       = ais_parse_student_name($ais->dashboardHtml());
    if ($name !== '' && !isset($profile['Name'])) {
        $profile = array_merge(['Name' => $name], $profile);
    }

    $attendance = ais_parse_attendance($page);
    $semesters  = [];
    $usedSem    = $wantSem !== '' ? $wantSem : ($profile['Semester'] ?? null);

    // The attendance link serves a semester picker, not the table.
    if (empty($attendance['rows'])) {
        $form = ais_find_semester_form($page, AIS_ATTENDANCE);
        if (!$form) {
            $ais->close();
            out(false, 'Signed in, but neither an attendance table nor a semester form was found.', [
                'loggedIn' => ($action === 'fetch'),
                'profile'  => $profile,
                'tables'   => $attendance['tables'] ?? [],
                'forms'    => ais_describe_forms($page),
            ]);
        }

        $semesters = array_values(array_filter($form['options'], function ($v) {
            return preg_match('/^\s*\d+\s*$/', $v);
        }));
        $sem = $wantSem !== ''
            ? $wantSem
            : (isset($profile['Semester']) && $profile['Semester'] !== ''
                ? $profile['Semester']
                : (count($semesters) ? end($semesters) : ''));
        if ($sem !== '' && $semesters && !in_array((string) $sem, $semesters, true)) {
            $sem = end($semesters);
        }
        $usedSem = $sem;

        $fields = $form['fields'];
        $fields[$form['selectName']] = $sem;

        $result = ($form['method'] === 'POST')
            ? $ais->post($form['action'], $fields, AIS_ATTENDANCE)
            : $ais->get($form['action'] . '?' . http_build_query($fields));

        $attendance = ais_parse_attendance($result);

        if (empty($attendance['rows'])) {
            $ais->close();
            out(false, 'Submitted semester ' . $sem . ', but the attendance table was not recognised.', [
                'loggedIn'     => ($action === 'fetch'),
                'profile'      => $profile,
                'semesters'    => $semesters,
                'usedSemester' => $sem,
                'tables'       => $attendance['tables'] ?? [],
                'forms'        => ais_describe_forms($result),
            ]);
        }
    }
    $ais->close();

    // The semester list is only discovered when the picker is submitted. If this
    // fetch skipped that step, keep the list already known for this sign-in
    // rather than dropping it and falling back to a guess.
    if (empty($semesters) && $store && !empty($store['data']['semesters'])) {
        $semesters = $store['data']['semesters'];
    }

    $fetchedAt = date('c');
    $payload   = [
        'u'          => $user,
        'p'          => $pass,
        'profile'    => $profile,
        'attendance' => $attendance['rows'],
        'semesters'  => $semesters,
        'semester'   => $usedSem,
        'fetchedAt'  => $fetchedAt,
    ];

    // Only persist once AIS has actually accepted the credentials.
    if ($action === 'login') {
        ais_store_save($payload);
    } else {
        ais_store_update($store['token'], $store['key'], $payload);
    }
    unset($pass, $payload['p'], $_POST['ais_pass']);

    out(true, 'Fetched ' . count($attendance['rows']) . ' subjects.', [
        'loggedIn'     => true,
        'aisUser'      => $user,
        'profile'      => $profile,
        'attendance'   => $attendance['rows'],
        'semesters'    => $semesters,
        'usedSemester' => $usedSem,
        'fetchedAt'    => $fetchedAt,
    ]);

} catch (AisException $e) {
    $ais->close();
    // A stored password that AIS now rejects (changed password) must not leave
    // the user stuck in a loop - drop it and ask for a fresh sign-in.
    $stale = ($action === 'fetch' && stripos($e->getMessage(), 'rejected those credentials') !== false);
    if ($stale) { ais_store_clear(); }
    out(false, $e->getMessage(), ['loggedIn' => $stale ? false : ($action === 'fetch')]);
}

<?php
// ============================================================
//  db.php — Database Configuration & Connection Helper
//  Auto-detects environment: Localhost (XAMPP) vs InfinityFree
// ============================================================

// Detect if running on localhost / dev or live hosting
$httpHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$isLocal = (
    empty($httpHost) ||
    strpos($httpHost, 'localhost') !== false ||
    strpos($httpHost, '127.0.0.1') !== false ||
    strpos($httpHost, '::1') !== false ||
    php_sapi_name() === 'cli'
);

if ($isLocal) {
    // ── Localhost (XAMPP) Environment ───────────────────────
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');           // Default XAMPP — no password
    define('DB_NAME', 'tat_sangam');
    define('DB_PORT', 3306);
} else {
    // ── InfinityFree Live Hosting Environment ───────────────
    define('DB_HOST', 'sql113.infinityfree.com');
    define('DB_USER', 'if0_42656834');
    define('DB_PASS', 'oioZkM3RgQ');
    define('DB_NAME', 'if0_42656834_tat_sangam');
    define('DB_PORT', 3306);
}

// ── Database Connection Function ────────────────────────────
function getDB() {
    try {
        $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed (' . DB_HOST . '): ' . $conn->connect_error . '. Please verify database status and credentials.'
            ]);
            exit;
        }
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
        exit;
    }
}

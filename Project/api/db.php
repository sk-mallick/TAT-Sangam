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

// ── Automatic Table & Schema Initialization ─────────────────
function autoInitDatabase($conn) {
    try {
        // Create users table if it doesn't exist
        $createTableSql = "CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `reg_no` VARCHAR(50) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `branch` VARCHAR(20) NOT NULL,
            `semester` VARCHAR(10) DEFAULT '7th',
            `grp` VARCHAR(5) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `last_login` TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->query($createTableSql);

        // Seed default admin account if not already present (plain text password: admin123)
        $adminCheck = $conn->query("SELECT `id` FROM `users` WHERE `reg_no` = 'admin' LIMIT 1");
        if ($adminCheck && $adminCheck->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO `users` (`name`, `reg_no`, `password`, `branch`, `grp`) VALUES ('Administrator', 'admin', 'admin123', 'ADMIN', '1')");
            if ($stmt) {
                $stmt->execute();
                $stmt->close();
            }
        }
    } catch (Throwable $e) {
        error_log('Database auto-init error: ' . $e->getMessage());
    }
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
        
        // Automatically ensure tables & default accounts are created
        autoInitDatabase($conn);
        
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

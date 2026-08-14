<?php
// ============================================================
//  auth.php — Single PHP backend for My Daily Planner Auth
//  Handles: register, login, check_session, logout
//  All requests via POST with 'action' parameter
// ============================================================

// Turn off HTML error output to prevent corrupting JSON responses
ini_set('display_errors', '0');
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include database connection & environment configuration
require_once __DIR__ . '/db.php';

// ── Helper: Send JSON Response ──────────────────────────────
function respond($success, $message = '', $data = []) {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// ── Helper: Sanitize Input ──────────────────────────────────
function clean($value) {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

// Global exception catcher to always return JSON
set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server exception: ' . $e->getMessage()]);
    exit;
});

// ── Route by Action ─────────────────────────────────────────
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    // ─────────────────────────────────────────────────────────
    //  REGISTER
    // ─────────────────────────────────────────────────────────
    case 'register':
        $name     = clean($_POST['name']     ?? '');
        $reg_no   = clean($_POST['reg_no']   ?? '');
        $password = $_POST['password']        ?? '';
        $branch   = clean($_POST['branch']   ?? '');
        $grp      = clean($_POST['grp']      ?? '');

        // Validation
        if (empty($name) || empty($reg_no) || empty($password) || empty($branch) || empty($grp)) {
            respond(false, 'All fields are required');
        }

        if (strlen($name) < 2) {
            respond(false, 'Name must be at least 2 characters');
        }

        if (strlen($reg_no) < 5 || !preg_match('/^[A-Za-z0-9]+$/', $reg_no)) {
            respond(false, 'Registration number must be at least 5 alphanumeric characters');
        }

        if (strlen($password) < 6) {
            respond(false, 'Password must be at least 6 characters');
        }

        $conn = getDB();

        // Check if reg_no already exists
        $stmt = $conn->prepare('SELECT id FROM users WHERE reg_no = ?');
        if (!$stmt) {
            respond(false, 'Database query error (SELECT): ' . $conn->error);
        }
        $stmt->bind_param('s', $reg_no);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->close();
            $conn->close();
            respond(false, 'A user with this registration number already exists');
        }
        $stmt->close();

        // Hash password with bcrypt
        $hashed = password_hash($password, PASSWORD_BCRYPT);

        // Insert user
        $stmt = $conn->prepare('INSERT INTO users (name, reg_no, password, branch, grp) VALUES (?, ?, ?, ?, ?)');
        if (!$stmt) {
            $conn->close();
            respond(false, 'Database query error (INSERT): ' . $conn->error);
        }
        $stmt->bind_param('sssss', $name, $reg_no, $hashed, $branch, $grp);

        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            respond(true, 'Account created successfully');
        } else {
            $err = $stmt->error;
            $stmt->close();
            $conn->close();
            respond(false, 'Registration failed: ' . $err);
        }
        break;

    // ─────────────────────────────────────────────────────────
    //  LOGIN
    // ─────────────────────────────────────────────────────────
    case 'login':
        $reg_no   = clean($_POST['reg_no']   ?? '');
        $password = $_POST['password']        ?? '';

        if (empty($reg_no) || empty($password)) {
            respond(false, 'Please enter both registration number and password');
        }

        $conn = getDB();

        $stmt = $conn->prepare('SELECT id, name, reg_no, password, branch, semester, grp FROM users WHERE reg_no = ?');
        if (!$stmt) {
            $conn->close();
            respond(false, 'Database query error (SELECT): ' . $conn->error);
        }
        $stmt->bind_param('s', $reg_no);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $stmt->close();
            $conn->close();
            respond(false, 'User not found. Please check your registration number.');
        }

        $user = $result->fetch_assoc();
        $stmt->close();

        // Verify password
        if (!password_verify($password, $user['password'])) {
            $conn->close();
            respond(false, 'Incorrect password. Please try again.');
        }

        // Update last_login
        $updateStmt = $conn->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
        if ($updateStmt) {
            $updateStmt->bind_param('i', $user['id']);
            $updateStmt->execute();
            $updateStmt->close();
        }
        $conn->close();

        // Set session
        $_SESSION['user_id']  = $user['id'];
        $_SESSION['reg_no']   = $user['reg_no'];
        $_SESSION['name']     = $user['name'];
        $_SESSION['branch']   = $user['branch'];
        $_SESSION['semester'] = $user['semester'];
        $_SESSION['grp']      = $user['grp'];

        // Return user data (without password)
        respond(true, 'Login successful', [
            'user' => [
                'name'     => $user['name'],
                'regNo'    => $user['reg_no'],
                'branch'   => $user['branch'],
                'semester' => $user['semester'],
                'group'    => $user['grp']
            ]
        ]);
        break;

    // ─────────────────────────────────────────────────────────
    //  CHECK SESSION
    // ─────────────────────────────────────────────────────────
    case 'check_session':
        if (isset($_SESSION['user_id'])) {
            respond(true, 'Session active', [
                'user' => [
                    'name'     => $_SESSION['name'],
                    'regNo'    => $_SESSION['reg_no'],
                    'branch'   => $_SESSION['branch'],
                    'semester' => $_SESSION['semester'],
                    'group'    => $_SESSION['grp']
                ]
            ]);
        } else {
            respond(false, 'No active session');
        }
        break;

    // ─────────────────────────────────────────────────────────
    //  LOGOUT
    // ─────────────────────────────────────────────────────────
    case 'logout':
        session_unset();
        session_destroy();
        respond(true, 'Logged out successfully');
        break;

    // ─────────────────────────────────────────────────────────
    //  DEFAULT — Invalid Action
    // ─────────────────────────────────────────────────────────
    default:
        respond(false, 'Invalid action. Use: register, login, check_session, or logout');
        break;
}

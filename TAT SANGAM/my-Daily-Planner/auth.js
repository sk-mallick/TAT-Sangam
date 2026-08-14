// ============================================================
//  auth.js — Authentication for My Daily Planner
//  Server-side auth via PHP + MySQL backend
//  • Passwords hashed with bcrypt on server
//  • PHP sessions for login state
//  • fetch() API calls to api/auth.php
// ============================================================

// Constants
const PLANNER_VERSION = '1.1.0';
const MIN_PASSWORD_LENGTH = 6;
const API_URL = 'api/auth.php';

// Data structure template for new planner data
const defaultPlannerData = {
    todos: [],
    links: {
        personal: [],
        quick: [],
        ai: []
    },
    settings: {
        theme: 'light',
        version: PLANNER_VERSION
    }
};

// ------------------------------------------------------------
// Utility Functions
// ------------------------------------------------------------
function validateRegNo(regNo) {
    return regNo.length >= 5 && /^[A-Za-z0-9]+$/.test(regNo);
}

function sanitizeInput(input) {
    return String(input || '').trim().replace(/[<>"'&]/g, '');
}

function isValidPassword(password) {
    return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

// ------------------------------------------------------------
// API Helper — Send POST to auth.php
// ------------------------------------------------------------
async function authRequest(action, data = {}) {
    try {
        const formData = new FormData();
        formData.append('action', action);
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    } catch (error) {
        console.error(`Auth request (${action}) failed:`, error);
        return { success: false, message: 'Network error. Please check your connection.' };
    }
}

// ------------------------------------------------------------
// Form validation setup
// ------------------------------------------------------------
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Handle password visibility toggle
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            const passwordInput = document.getElementById('userPassword');
            const icon = this.querySelector('i');

            if (passwordInput && icon) {
                const showing = passwordInput.type === 'text';
                passwordInput.type = showing ? 'password' : 'text';
                icon.classList.toggle('fa-eye', showing);
                icon.classList.toggle('fa-eye-slash', !showing);
            }
        });
    }
}

// ------------------------------------------------------------
// Multi-step signup form handling
// ------------------------------------------------------------
let currentStep = 1;

function validateStep1() {
    const name = document.getElementById('userName')?.value;
    const regNo = document.getElementById('userRegNo')?.value;
    const password = document.getElementById('userPassword')?.value;

    if (!name || !regNo || !password) {
        showError('Please fill in all fields in Step 1');
        return false;
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedRegNo = sanitizeInput(regNo);

    if (sanitizedName.length < 2) {
        showError('Name must be at least 2 characters long');
        return false;
    }

    if (!validateRegNo(sanitizedRegNo)) {
        showError('Please enter a valid registration number (letters & numbers only, min 5 characters)');
        return false;
    }

    if (!isValidPassword(password)) {
        showError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        return false;
    }

    return true;
}

function validateStep2() {
    const branch = document.getElementById('userBranch')?.value;
    const group = document.getElementById('userGroup')?.value;

    if (!branch || !group) {
        showError('Please fill in all fields in Step 2');
        return false;
    }

    return true;
}

function nextStep() {
    if (currentStep === 1 && validateStep1()) {
        try {
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            document.getElementById('step1Label').classList.remove('active');
            document.getElementById('step2Label').classList.add('active');
            document.getElementById('progressBar').style.width = '100%';
            currentStep = 2;
        } catch (error) {
            console.error('Error in nextStep:', error);
            showError('An error occurred. Please try again.');
        }
    }
}

function prevStep() {
    if (currentStep === 2) {
        try {
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step1').classList.add('active');
            document.getElementById('step2Label').classList.remove('active');
            document.getElementById('step1Label').classList.add('active');
            document.getElementById('progressBar').style.width = '50%';
            currentStep = 1;
        } catch (error) {
            console.error('Error in prevStep:', error);
            showError('An error occurred. Please try again.');
        }
    }
}

// ------------------------------------------------------------
// Message handling
// ------------------------------------------------------------
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mt-3`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Remove existing messages
    document.querySelectorAll('.alert').forEach(alert => alert.remove());

    // Add new message
    const form = document.querySelector('form');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(messageDiv, form);

        // Auto dismiss
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 150);
        }, 5000);
    }
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

// ------------------------------------------------------------
// Submit-button loading state
// ------------------------------------------------------------
function setButtonLoading(btn, loadingText) {
    if (!btn) return;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${loadingText}`;
}

function resetButtonLoading(btn) {
    if (!btn || btn.dataset.originalHtml === undefined) return;
    btn.innerHTML = btn.dataset.originalHtml;
    btn.disabled = false;
}

// ------------------------------------------------------------
// Handle signup form submission — POST to PHP backend
// ------------------------------------------------------------
document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateStep2()) return;

    const submitBtn = this.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, ' Creating account...');

    try {
        const name = sanitizeInput(document.getElementById('userName').value);
        const reg_no = sanitizeInput(document.getElementById('userRegNo').value);
        const password = document.getElementById('userPassword').value;
        const branch = document.getElementById('userBranch').value;
        const grp = document.getElementById('userGroup').value;

        const result = await authRequest('register', {
            name, reg_no, password, branch, grp
        });

        if (result.success) {
            showSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showError(result.message || 'Registration failed. Please try again.');
            resetButtonLoading(submitBtn);
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('An error occurred during signup. Please try again.');
        resetButtonLoading(submitBtn);
    }
});

// ------------------------------------------------------------
// Handle login form submission — POST to PHP backend
// ------------------------------------------------------------
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');

    try {
        const reg_no = sanitizeInput(document.getElementById('userRegNo').value);
        const password = document.getElementById('userPassword').value;

        if (!reg_no || !password) {
            showError('Please enter both your ID and password.');
            return;
        }

        setButtonLoading(submitBtn, ' Signing in...');

        const result = await authRequest('login', { reg_no, password });

        if (result.success) {
            // Store user info in localStorage for planner usage
            const user = result.user;
            localStorage.setItem('currentUser', user.regNo);
            localStorage.setItem(`user_${user.regNo}`, JSON.stringify({
                name: user.name,
                regNo: user.regNo,
                branch: user.branch,
                semester: user.semester,
                group: user.group,
                lastLogin: new Date().toISOString()
            }));

            // Initialize planner data if not exists
            if (!localStorage.getItem(`planner_${user.regNo}`)) {
                localStorage.setItem(`planner_${user.regNo}`, JSON.stringify({
                    ...defaultPlannerData,
                    createdAt: new Date().toISOString()
                }));
            }

            showSuccess('Login successful! Redirecting...');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(result.message || 'Login failed. Please try again.');
            resetButtonLoading(submitBtn);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login. Please try again.');
        resetButtonLoading(submitBtn);
    }
});

// ------------------------------------------------------------
// Auth guard — check PHP session
// ------------------------------------------------------------
async function checkAuth() {
    try {
        const isLoginPage = window.location.pathname.includes('login.html');
        const isSignupPage = window.location.pathname.includes('signup.html');

        const result = await authRequest('check_session');

        if (result.success) {
            // Session active — sync localStorage
            const user = result.user;
            localStorage.setItem('currentUser', user.regNo);
            localStorage.setItem(`user_${user.regNo}`, JSON.stringify({
                name: user.name,
                regNo: user.regNo,
                branch: user.branch,
                semester: user.semester,
                group: user.group
            }));

            // Redirect away from auth pages
            if (isLoginPage || isSignupPage) {
                window.location.href = 'index.html';
            }
        } else {
            // No active session
            localStorage.removeItem('currentUser');

            if (!isLoginPage && !isSignupPage) {
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('currentUser');
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

// ------------------------------------------------------------
// Logout — destroy PHP session + clear localStorage
// ------------------------------------------------------------
async function logout() {
    try {
        await authRequest('logout');
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ------------------------------------------------------------
// Initialize
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    try {
        setupFormValidation();
        setupPasswordToggle();
        await checkAuth();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

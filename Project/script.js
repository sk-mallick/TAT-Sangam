// ============================================================
//  script.js — Main app logic for TAT SANGAM
//  Fixes & upgrades in this version:
//   • Removed top-level logoutBtn listener that could crash the
//     whole script on pages where the button doesn't exist
//   • Fixed delete-wrong-task bug when a filter was active
//     (index was taken from the *filtered* list, not the real one)
//   • Escaped user text before injecting into innerHTML (XSS fix)
//   • Timetable countdown intervals are now tracked and cleared on
//     every re-render (previously they leaked and stacked forever)
//   • Timetable auto-refreshes each minute so class status colors
//     (upcoming / ongoing / finished) stay correct without reload
//   • Link color picker value is now actually applied to link icons
//   • Link URLs are normalized (https:// auto-prefixed) & validated
//   • guessIcon() now matches partial names ("My GitHub" → GitHub)
//   • Todos are sorted by deadline, then priority
//   • One-click data export (⚙ button) replaces the console snippet
// ============================================================

// Global Variables
let todos = [];
let links = {};
let currentFilter = "all";
let deleteMode = false;
let currentLinkGroup = "personal";
let linkDeleteMode = false;
let currentView = 'today';
let selectedDate = new Date();
let currentMonth = new Date();

// Track timetable countdown intervals so we can clear them on re-render
let timetableIntervals = [];

const defaultUserData = {
    todos: [],
    links: {
        personal: [],
        quick: [],
        ai: []
    }
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

// ------------------------------------------------------------
// Theme (dark / light) with persistence
// ------------------------------------------------------------
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function applyThemeIcons(theme) {
    document.querySelectorAll('.theme-toggle i').forEach(icon => {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        // Header buttons show no hover tooltip; aria-label carries the name.
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage may be blocked */ }
    applyThemeIcons(theme);
}

function toggleTheme() {
    setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
}

// ------------------------------------------------------------
// Load user data into app
// ------------------------------------------------------------
function loadUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get user data
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        if (!userData) {
            handleLogout();
            return;
        }

        // Get planner data
        const plannerData = JSON.parse(localStorage.getItem(`planner_${currentUser}`)) || defaultUserData;

        // Load todos
        todos = Array.isArray(plannerData.todos) ? plannerData.todos : [];
        renderTodos();

        // Load links
        links = plannerData.links || structuredClone(defaultUserData.links);
        renderLinks();

        // Pick the timetable for this user's branch and refresh the view
        setBranchTimetable(userData.branch);
        if (typeof renderTimetable === 'function' && currentView === 'today') {
            renderTimetable(selectedDate.toLocaleDateString("en-US", { weekday: "long" }));
        }

        // Display username - Desktop
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            const userNameEl = userDisplay.querySelector('.user-name');
            const userRegEl = userDisplay.querySelector('.user-reg');
            const userBranchEl = userDisplay.querySelector('.user-branch');
            const userGroupEl = userDisplay.querySelector('.user-group');

            if (userNameEl) userNameEl.textContent = userData.name;
            if (userRegEl) userRegEl.textContent = userData.regNo;
            if (userBranchEl) userBranchEl.textContent = userData.branch;
            if (userGroupEl) userGroupEl.textContent = userData.group ? `G${userData.group}` : 'G1';
        }

        // Display username - Mobile
        const userNameMobile = document.querySelector('.user-name-mobile');
        const userRegMobile = document.querySelector('.user-meta-mobile .user-reg');
        const userBranchMobile = document.querySelector('.user-meta-mobile .user-branch');
        const userGroupMobile = document.querySelector('.user-meta-mobile .user-group');

        if (userNameMobile) userNameMobile.textContent = userData.name;
        if (userRegMobile) userRegMobile.textContent = userData.regNo;
        if (userBranchMobile) userBranchMobile.textContent = userData.branch;
        if (userGroupMobile) userGroupMobile.textContent = userData.group ? `G${userData.group}` : 'G1';

    } catch (error) {
        console.error('Error loading user data:', error);
        handleLogout();
    }
}

// Save user data
function saveUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    try {
        const plannerData = {
            todos: todos,
            links: links,
            lastModified: new Date().toISOString()
        };

        localStorage.setItem(`planner_${currentUser}`, JSON.stringify(plannerData));
    } catch (error) {
        console.error('Error saving user data:', error);
        alert('Error saving your changes. Please try again.');
    }
}

// Export all of the current user's data as a JSON download
function exportUserData() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const payload = {
            exportedAt: new Date().toISOString(),
            user: JSON.parse(localStorage.getItem(`user_${currentUser}`) || 'null'),
            planner: JSON.parse(localStorage.getItem(`planner_${currentUser}`) || 'null')
        };
        // Never export password hashes
        if (payload.user) {
            delete payload.user.password;
            delete payload.user.passwordHash;
        }

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tat_sangam_${currentUser}_backup.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export error:', error);
        alert('Could not export your data. Please try again.');
    }
}

// Import user data from a JSON backup file
function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid backup format: root must be an object.");
            }

            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                alert("No logged in user found. Please login first.");
                return;
            }

            if (!data.planner || typeof data.planner !== 'object') {
                throw new Error("Invalid backup format: 'planner' object is missing.");
            }

            // Restore planner data for this user
            localStorage.setItem(`planner_${currentUser}`, JSON.stringify(data.planner));

            // If user details are present in backup, restore them too (preserving passwordHash)
            if (data.user && typeof data.user === 'object') {
                const existingUser = JSON.parse(localStorage.getItem(`user_${currentUser}`) || '{}');
                const mergedUser = {
                    ...existingUser,
                    name: data.user.name || existingUser.name,
                    regNo: data.user.regNo || existingUser.regNo,
                    branch: data.user.branch || existingUser.branch,
                    group: data.user.group || existingUser.group,
                    semester: data.user.semester || existingUser.semester
                };
                localStorage.setItem(`user_${currentUser}`, JSON.stringify(mergedUser));
            }

            alert("Data imported successfully! The page will now reload.");
            window.location.reload();
        } catch (error) {
            console.error("Import error:", error);
            alert("Error importing data: " + error.message);
        }
    };
    reader.readAsText(file);
    // Clear value so the same file can be imported again
    event.target.value = '';
}

// Handle logout
async function handleLogout(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const finish = async () => {
        try {
            const formData = new FormData();
            formData.append('action', 'logout');
            await fetch('api/auth.php', {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            console.error('Error during server logout:', error);
        }
        try {
            localStorage.removeItem('currentUser');
        } catch (error) {
            console.error('Error clearing localStorage on logout:', error);
        }
        window.location.href = 'login.html';
    };

    const appContent = document.getElementById('appContent');
    if (appContent) {
        appContent.classList.add('logging-out');
        setTimeout(finish, 260);
    } else {
        await finish();
    }
}
window.handleLogout = handleLogout;

// ------------------------------------------------------------
// Todo Management
// ------------------------------------------------------------
function toggleTodoForm() {
    const form = document.getElementById("todoForm");
    const list = document.getElementById("todo-list");
    const isHidden = form.classList.contains("d-none");

    if (isHidden) {
        form.classList.remove("d-none");
        list.classList.add("d-none");
    } else {
        form.classList.add("d-none");
        list.classList.remove("d-none");
    }
}

function addTodo() {
    const titleInput = document.getElementById("todoTitle");
    const title = titleInput.value.trim();
    const priority = document.getElementById("todoPriority").value;
    const deadline = document.getElementById("todoDeadline").value;

    if (!title) {
        titleInput.focus();
        return;
    }
    if (!deadline) {
        document.getElementById("todoDeadline").focus();
        return;
    }

    todos.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title,
        deadline,
        priority,
        status: "Not Done"
    });

    saveUserData();
    toggleTodoForm();

    titleInput.value = "";
    document.getElementById("todoDeadline").value = "";

    renderTodos();
}

function updateTodoProgressBadge() {
    const badge = document.getElementById("todoProgressBadge");
    if (!badge) return;
    if (todos.length === 0) {
        badge.textContent = "";
        badge.classList.remove("all-done");
        return;
    }
    const done = todos.filter(t => t.status === "Done").length;
    badge.textContent = `${done}/${todos.length}`;
    badge.classList.toggle("all-done", done === todos.length);
}

function renderTodos() {
    const list = document.getElementById("todo-list");
    if (!list) return;
    list.innerHTML = "";

    updateTodoProgressBadge();

    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    const filtered = todos
        .filter(todo => {
            if (currentFilter === "notdone") return todo.status !== "Done";
            if (currentFilter === "done") return todo.status === "Done";
            return true;
        })
        .sort((a, b) => {
            const dateDiff = new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
            if (dateDiff !== 0) return dateDiff;
            return (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3);
        });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="text-center text-muted p-4 empty-state">
                <i class="fas fa-tasks fa-2x mb-3"></i>
                <p>No tasks available</p>
                <button type="button" class="btn btn-sm btn-primary mt-1" onclick="handleMenuAction('new', event)">
                    <i class="fas fa-plus me-1"></i>Add your first task
                </button>
            </div>
        `;
        return;
    }

    filtered.forEach(todo => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        // Colored left-border accent by state / priority
        if (todo.status === "Done") {
            li.classList.add("done");
        } else if (todo.priority === "High") {
            li.classList.add("high-priority");
        } else if (todo.priority === "Medium") {
            li.classList.add("medium-priority");
        } else {
            li.classList.add("low-priority");
        }

        const leftSection = document.createElement("div");
        leftSection.className = "d-flex align-items-center gap-2";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.status === "Done";
        checkbox.classList.add("form-check-input", "me-2");
        checkbox.addEventListener("change", () => {
            todo.status = checkbox.checked ? "Done" : "Not Done";
            saveUserData();
            renderTodos();
        });

        const content = document.createElement("div");
        let stars = "";
        if (todo.priority === "High") stars = "⭐⭐⭐";
        else if (todo.priority === "Medium") stars = "⭐⭐";
        else if (todo.priority === "Low") stars = "⭐";

        // escapeHtml prevents task titles from injecting HTML/scripts
        content.innerHTML = `
            <div class="todo-text-wrap">
                <strong>${escapeHtml(todo.title)}</strong><br>
                <small>📌 ${escapeHtml(todo.deadline) || "No date"}   ${stars}</small>
            </div>
        `;

        leftSection.appendChild(checkbox);
        leftSection.appendChild(content);
        li.appendChild(leftSection);

        if (deleteMode) {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-danger";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.setAttribute("data-tooltip", "Delete Task");
            deleteBtn.setAttribute("aria-label", "Delete Task");
            deleteBtn.onclick = () => {
                // Delete by identity, not by filtered-list index
                const realIndex = todos.indexOf(todo);
                if (realIndex !== -1) {
                    todos.splice(realIndex, 1);
                    saveUserData();
                    renderTodos();
                }
            };
            li.appendChild(deleteBtn);
        }

        list.appendChild(li);
    });
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    renderTodos();

    const deleteBtn = document.getElementById("deleteToggleBtn");
    if (deleteBtn) {
        deleteBtn.classList.toggle("btn-danger", deleteMode);
        deleteBtn.classList.toggle("btn-outline-dark", !deleteMode);
        deleteBtn.classList.toggle("blinking-delete", deleteMode);
    }
}

function filterTodos(type) {
    currentFilter = type;
    renderTodos();
}

function handleMenuAction(action, event) {
    event.preventDefault();
    event.stopPropagation();

    const form = document.getElementById("todoForm");
    const list = document.getElementById("todo-list");

    if (action === 'new') {
        const isHidden = form.classList.contains("d-none");
        form.classList.toggle("d-none", !isHidden);
        list.classList.toggle("d-none", isHidden);
    } else {
        form.classList.add("d-none");
        list.classList.remove("d-none");
        filterTodos(action);
    }
}

// ------------------------------------------------------------
// Links Management
// ------------------------------------------------------------
function toggleLinkForm() {
    const formWrapper = document.getElementById("linkFormWrapper");
    const listWrapper = document.getElementById("linkListWrapper");
    const isHidden = formWrapper.classList.contains("d-none");
    formWrapper.classList.toggle("d-none", !isHidden);
    listWrapper.classList.toggle("d-none", isHidden);
}

function toggleLinkDeleteMode() {
    linkDeleteMode = !linkDeleteMode;
    document.getElementById("deleteLinkToggleBtn").classList.toggle("blinking-delete", linkDeleteMode);
    renderLinks();
}

function switchLinkGroup(group) {
    currentLinkGroup = group;
    document.getElementById("linkFormWrapper").classList.add("d-none");
    document.getElementById("linkListWrapper").classList.remove("d-none");

    document.querySelectorAll(".link-tab-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-group") === group) {
            btn.classList.add("active");
        }
    });

    renderLinks();
}

function addLink() {
    const name = document.getElementById("linkName").value.trim();
    const rawUrl = document.getElementById("linkURL").value.trim();
    const group = document.getElementById("linkGroup").value;
    const iconSelect = document.getElementById("linkIcon").value;
    const color = document.getElementById("linkColor").value;

    if (!name || !rawUrl || !group) return;

    const url = normalizeUrl(rawUrl);
    try {
        const parsed = new URL(url);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error('bad protocol');
    } catch (e) {
        alert('Please enter a valid link URL (e.g. https://github.com)');
        return;
    }

    const linkObj = {
        name,
        url,
        iconClass: iconSelect || guessIconClass(name),
        color
    };

    if (!links[group]) links[group] = [];
    links[group].push(linkObj);
    saveUserData();

    document.getElementById("linkName").value = "";
    document.getElementById("linkURL").value = "";
    document.getElementById("linkIcon").value = "";
    document.getElementById("linkGroup").value = currentLinkGroup;
    document.getElementById("linkColor").value = "#4b6cb7";

    toggleLinkForm();
    renderLinks();
}

function renderLinks() {
    const container = document.getElementById("tab-links");
    if (!container) return;
    container.innerHTML = "";

    const currentLinks = links[currentLinkGroup] || [];

    if (currentLinks.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-4 w-100 empty-state">
                <i class="fas fa-link fa-2x mb-3"></i>
                <p>No links available in ${escapeHtml(currentLinkGroup)} category</p>
                <button type="button" class="btn btn-sm btn-primary mt-1" onclick="toggleLinkForm()">
                    <i class="fas fa-plus me-1"></i>Add a link
                </button>
            </div>
        `;
        return;
    }

    currentLinks.forEach((link, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "link-wrapper";
        if (linkDeleteMode) {
            wrapper.classList.add("delete-mode");
        }

        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        // No hover tooltip on link tiles — in a dense grid it overlaps and hides
        // neighbouring tiles. The name is shown as a permanent label instead.
        a.setAttribute("aria-label", link.name);

        // Support both the new iconClass format and legacy stored HTML icons
        const icon = document.createElement("i");
        if (link.iconClass) {
            icon.className = link.iconClass;
        } else if (typeof link.icon === 'string') {
            const match = link.icon.match(/class="([^"]+)"/);
            icon.className = match ? match[1] : "fas fa-link";
        } else {
            icon.className = "fas fa-link";
        }
        a.appendChild(icon);

        a.className = "d-flex justify-content-center align-items-center text-decoration-none";
        // Icon shows the link's own brand colour; --lc drives the subtle hover fill.
        // Size, border and radius are handled in CSS (.link-wrapper a).
        if (link.color) {
            a.style.color = link.color;
            a.style.setProperty('--lc', link.color);
        }

        if (linkDeleteMode) {
            const deleteBtn = document.createElement("span");
            deleteBtn.className = "delete-icon";
            deleteBtn.innerHTML = "×";
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                links[currentLinkGroup].splice(index, 1);
                saveUserData();
                renderLinks();
            };
            wrapper.appendChild(deleteBtn);
        }

        wrapper.appendChild(a);

        // Permanent name label under the tile (replaces the hover tooltip)
        const label = document.createElement("span");
        label.className = "link-label";
        label.textContent = link.name;
        wrapper.appendChild(label);

        container.appendChild(wrapper);
    });
}

function guessIconClass(name) {
    const map = {
        github: 'fab fa-github',
        notion: 'fas fa-book',
        chatgpt: 'fas fa-robot',
        claude: 'fas fa-robot',
        gpt: 'fas fa-robot',
        ai: 'fas fa-brain',
        code: 'fas fa-code',
        leetcode: 'fas fa-code',
        youtube: 'fab fa-youtube',
        google: 'fab fa-google',
        linkedin: 'fab fa-linkedin',
        mail: 'fas fa-envelope',
        gmail: 'fas fa-envelope',
        drive: 'fab fa-google-drive'
    };
    const key = name.toLowerCase();
    for (const [word, cls] of Object.entries(map)) {
        if (key.includes(word)) return cls;
    }
    return 'fas fa-link';
}

// ------------------------------------------------------------
// Clock
// ------------------------------------------------------------
function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    const session = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const timeStr = `${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${session}`;
    const dayStr = now.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = now.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    const timeEl = document.getElementById("clockTime");
    const dayEl = document.getElementById("clockDay");
    const dateEl = document.getElementById("clockDate");
    if (timeEl) timeEl.textContent = timeStr;
    if (dayEl) dayEl.textContent = dayStr;
    if (dateEl) dateEl.textContent = dateStr;
}

// ------------------------------------------------------------
// Timetable Data — 7th Semester master timetable (w.e.f. 20 July 2026)
// The schedule shown depends on the branch the user picked at signup.
// All branch schedules are loaded dynamically from timetable.json,
// keyed by the signup branch value (CSE-A, CST-B, CST-IT, …).
// ------------------------------------------------------------
const DEFAULT_BRANCH = 'CST-B';

// In-memory cache of all branch schedules loaded from timetable.json
let branchTimetables = {};
let timetableLoaded = false;

// Active timetable ({ Monday: [...], ... }); populated from the user's branch.
let timetable = {};

function setBranchTimetable(branch) {
    // Fall back to the default branch for unknown branches (e.g. the admin account)
    timetable = branchTimetables[branch] || branchTimetables[DEFAULT_BRANCH] || {};
}

async function loadTimetableData() {
    try {
        const response = await fetch('timetable.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch timetable.json`);
        }
        branchTimetables = await response.json();
        timetableLoaded = true;

        // Apply schedule for the current user's branch
        const currentUser = localStorage.getItem('currentUser');
        let branch = DEFAULT_BRANCH;
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`) || '{}');
            if (userData.branch) branch = userData.branch;
        }
        setBranchTimetable(branch);

        // Re-render current timetable view once loaded
        if (currentView === 'today') {
            renderTimetable(selectedDate.toLocaleDateString("en-US", { weekday: "long" }));
        } else if (currentView === 'week') {
            renderCalendar();
        }
    } catch (error) {
        console.error('Error loading timetable.json:', error);
        timetableLoaded = true;
        const container = document.getElementById("daily-timetable");
        if (container) {
            container.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3 text-warning"></i>
                    <p>Unable to load timetable data.</p>
                </div>
            `;
        }
    }
}

// ------------------------------------------------------------
// Timetable rendering
// ------------------------------------------------------------
function parseTime(str) {
    const [time, period] = str.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
}

function clearTimetableIntervals() {
    timetableIntervals.forEach(id => clearInterval(id));
    timetableIntervals = [];
}

function renderTimetable(day) {
    const container = document.getElementById("daily-timetable");
    if (!container) return;

    // Prevent countdown intervals from stacking on every re-render
    clearTimetableIntervals();

    if (!timetableLoaded) {
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                <p>Loading schedule...</p>
            </div>
        `;
        return;
    }

    const todaySchedule = timetable[day] || [];

    if (todaySchedule.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-table-list fa-2x mb-3"></i>
                <p>No classes scheduled for ${escapeHtml(day)}</p>
            </div>
        `;
        return;
    }

    let html = `<div class="d-flex flex-column gap-2">`;

    todaySchedule.forEach((item, index) => {
        if (item.break) {
            html += `
                <div class="border border-secondary rounded px-3 py-2 text-muted fw-bold bg-light text-center" data-tooltip="Break Time" aria-label="Break Time">
                    🍽️ Break (10:45 – 11:40) 🍽️
                </div>`;
        } else {
            const [startStr, endStr] = item.time.split(" - ");
            const startTime = parseTime(startStr);
            const endTime = parseTime(endStr);

            const start = new Date(selectedDate);
            const end = new Date(selectedDate);
            start.setHours(startTime.hours, startTime.minutes, 0, 0);
            end.setHours(endTime.hours, endTime.minutes, 0, 0);
            const now = new Date();
            const timerId = `timer-${day}-${index}`;
            const slotId = `slot-${timerId}`;

            // Compare dates without time
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const compareDate = new Date(selectedDate);
            compareDate.setHours(0, 0, 0, 0);

            let initialClass = "";
            if (compareDate.getTime() === today.getTime()) {
                if (now >= start && now <= end) {
                    initialClass = "bg-success text-white";
                } else if (now > end) {
                    initialClass = "bg-danger text-white";
                } else {
                    initialClass = "bg-warning text-dark";
                }
            } else if (compareDate > today) {
                initialClass = "bg-warning text-dark";
            } else {
                initialClass = "bg-danger text-white";
            }

            const fullLabel = `${item.subject}${item.teacher ? ` (${item.teacher})` : ''}${item.room ? ` [${item.room}]` : ''}`;

            html += `
                <div id="${slotId}" class="border rounded px-3 py-2 ${initialClass} text-center" data-tooltip="${escapeHtml(item.time)}" aria-label="${escapeHtml(item.time)}">
                    <div class="d-flex flex-column gap-1">
                        <span class="fw-bold" style="word-break: break-word;">${escapeHtml(fullLabel)}</span>
                        <span id="${timerId}" class="small fw-normal text-center d-block text-nowrap"></span>
                    </div>
                </div>`;

            // Live countdown for today's currently running class
            if (compareDate.getTime() === today.getTime() && now >= start && now <= end) {
                const intervalId = setInterval(() => {
                    const nowCurrent = new Date();
                    const timerEl = document.getElementById(timerId);
                    if (!timerEl) {
                        clearInterval(intervalId);
                        return;
                    }

                    if (nowCurrent >= start && nowCurrent <= end) {
                        const diff = end - nowCurrent;
                        const hrs = Math.floor(diff / 3600000);
                        const mins = Math.floor((diff % 3600000) / 60000);
                        const secs = Math.floor((diff % 60000) / 1000);
                        timerEl.textContent = `⏳ ${hrs} hour ${mins} min ${secs} sec left`;
                    } else {
                        // Class ended — stop the countdown and refresh statuses
                        clearInterval(intervalId);
                        renderTimetable(day);
                    }
                }, 1000);
                timetableIntervals.push(intervalId);
            }
        }
    });

    html += `</div>`;
    container.innerHTML = html;
}

function switchTimetableView(view) {
    currentView = view;
    document.getElementById('todayViewBtn').classList.toggle('active', view === 'today');
    document.getElementById('weekViewBtn').classList.toggle('active', view === 'week');
    document.getElementById('daily-timetable').classList.toggle('d-none', view === 'week');
    document.getElementById('week-calendar').classList.toggle('d-none', view === 'today');

    // Update Today button text
    const todayBtn = document.getElementById('todayViewBtn');
    if (selectedDate.toDateString() === new Date().toDateString()) {
        todayBtn.innerHTML = '<i class="fas fa-sun"></i> Today';
    } else {
        const dateStr = selectedDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short'
        });
        todayBtn.innerHTML = `<i class="fas fa-sun"></i> ${dateStr}`;
    }

    if (view === 'week') {
        renderCalendar();
    } else {
        renderTimetable(selectedDate.toLocaleDateString("en-US", { weekday: "long" }));
    }
}

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    document.getElementById('calendar-month').textContent = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    let calendarHTML = '';

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        calendarHTML += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(year, month, i);
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const hasClasses = timetable[dayName] ? 'has-classes' : '';

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasClasses}"
                 onclick="selectDate(${year}, ${month}, ${i})">
                <span class="day-number">${i}</span>
            </div>`;
    }

    // Next month days
    const remainingDays = (7 - ((startingDay + totalDays) % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
        calendarHTML += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
    }

    document.getElementById('calendar-days').innerHTML = calendarHTML;
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);

    if (currentView === 'week') {
        renderCalendar();
    }

    switchTimetableView('today');
}

// ------------------------------------------------------------
// Initialize app and event listeners
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Logout buttons (guarded — no crash if a button is missing)
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

    // Export data button (desktop + mobile)
    const exportBtn = document.getElementById('exportBtn');
    const exportBtnMobile = document.getElementById('exportBtnMobile');
    if (exportBtn) exportBtn.addEventListener('click', exportUserData);
    if (exportBtnMobile) exportBtnMobile.addEventListener('click', exportUserData);

    // Import data buttons (desktop + mobile)
    const importBtn = document.getElementById('importBtn');
    const importBtnMobile = document.getElementById('importBtnMobile');
    const importFile = document.getElementById('importFile');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
    }
    if (importBtnMobile && importFile) {
        importBtnMobile.addEventListener('click', () => importFile.click());
    }
    if (importFile) {
        importFile.addEventListener('change', handleImportData);
    }

    // Theme toggle buttons (desktop + mobile) + sync icons with saved theme
    applyThemeIcons(getCurrentTheme());
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    // Load user data & timetable JSON
    loadUserData();
    loadTimetableData();

    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);

    // Set initial timetable view
    currentView = 'today';
    selectedDate = new Date();
    const today = selectedDate.toLocaleDateString("en-US", { weekday: "long" });

    const todayViewBtn = document.getElementById('todayViewBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const dailyTimetable = document.getElementById('daily-timetable');
    const weekCalendar = document.getElementById('week-calendar');

    if (todayViewBtn) todayViewBtn.classList.add('active');
    if (weekViewBtn) weekViewBtn.classList.remove('active');
    if (dailyTimetable) dailyTimetable.classList.remove('d-none');
    if (weekCalendar) weekCalendar.classList.add('d-none');

    // Scroll-to-change on select inputs
    document.querySelectorAll(".scroll-select").forEach(select => {
        select.addEventListener("wheel", (e) => {
            e.preventDefault();
            const options = select.options;
            const index = select.selectedIndex;

            if (e.deltaY > 0 && index < options.length - 1) {
                select.selectedIndex = index + 1;
            } else if (e.deltaY < 0 && index > 0) {
                select.selectedIndex = index - 1;
            }
        });
    });

    // Render initial timetable
    renderTimetable(today);

    // Keep class status colors fresh (upcoming → ongoing → done)
    setInterval(() => {
        if (currentView === 'today' &&
            selectedDate.toDateString() === new Date().toDateString()) {
            renderTimetable(new Date().toLocaleDateString("en-US", { weekday: "long" }));
        }
    }, 60000);
});

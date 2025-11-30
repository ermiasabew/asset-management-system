// Global state
const state = {
    user: null,
    token: null,
    currentPage: 'dashboard',
    theme: localStorage.getItem('theme') || 'light'
};

// API Base URL
const API_URL = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    setupEventListeners();
});

// Theme management
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    initTheme();
}

// Auth check
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        state.token = token;
        fetchCurrentUser();
    } else {
        showLogin();
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (response.ok) {
            state.user = await response.json();
            showMainApp();
            loadDashboard();
            loadNotifications();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth error:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('userName').textContent = state.user.full_name || state.user.username;
    
    // Show/hide menu items based on role
    updateMenuVisibility();
}

function updateMenuVisibility() {
    const role = state.user.role;
    
    // Define which roles can access which pages
    const menuAccess = {
        dashboard: ['admin', 'asset_manager', 'inventory_manager', 'hr_manager', 'client_manager', 'accountant'],
        assets: ['admin', 'asset_manager'],
        inventory: ['admin', 'inventory_manager'],
        employees: ['admin', 'hr_manager'],
        clients: ['admin', 'client_manager'],
        rentals: ['admin', 'asset_manager'],
        reports: ['admin', 'accountant'],
        users: ['admin']
    };
    
    // Show/hide menu items
    document.querySelectorAll('.nav-item').forEach(item => {
        const page = item.dataset.page;
        if (menuAccess[page]) {
            item.style.display = menuAccess[page].includes(role) ? 'flex' : 'none';
        }
    });
}

// Event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        // On mobile, toggle 'open' class
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.classList.toggle('active');
            }
        } else {
            // On desktop, toggle 'collapsed' class
            sidebar.classList.toggle('collapsed');
        }
    });
    
    // Close sidebar when clicking overlay (mobile)
    document.querySelector('.sidebar-overlay')?.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // User menu
    document.getElementById('userMenuBtn')?.addEventListener('click', () => {
        document.getElementById('userDropdown').classList.toggle('show');
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Notifications
    document.getElementById('notificationBtn')?.addEventListener('click', () => {
        document.getElementById('notificationPanel').classList.toggle('open');
    });
    
    document.getElementById('closeNotifications')?.addEventListener('click', () => {
        document.getElementById('notificationPanel').classList.remove('open');
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown')?.classList.remove('show');
        }
    });
}

// Navigation
function navigateTo(page) {
    state.currentPage = page;
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        assets: 'Asset Management',
        inventory: 'Inventory Management',
        employees: 'Employee Management',
        clients: 'Client Management',
        rentals: 'Rental Properties',
        reports: 'Reports & Analytics',
        users: 'User Management',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    
    // Load page content
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'assets':
            loadAssets();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'clients':
            loadClients();
            break;
        case 'rentals':
            loadRentals();
            break;
        case 'reports':
            loadReports();
            break;
        case 'users':
            if (state.user.role === 'admin') {
                loadUsers();
            } else {
                document.getElementById('contentArea').innerHTML = showError('Access denied. Admin only.');
            }
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    state.token = null;
    state.user = null;
    showLogin();
}

// API helper
async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    if (state.token) {
        config.headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Notifications
async function loadNotifications() {
    try {
        const notifications = await apiRequest('/reports/notifications');
        const notificationList = document.getElementById('notificationList');
        const notificationCount = document.getElementById('notificationCount');
        
        notificationCount.textContent = notifications.length;
        notificationCount.style.display = notifications.length > 0 ? 'block' : 'none';
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No notifications</p>';
            return;
        }
        
        notificationList.innerHTML = notifications.map(n => `
            <div class="notification-item ${n.type}">
                <strong>${n.title}</strong>
                <p style="margin-top: 4px; font-size: 14px;">${n.message}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

// Modal helper
function showModal(title, content, buttons = []) {
    // Remove any existing modals first to prevent duplicates
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(m => m.remove());
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
        <h2>${title}</h2>
        <button class="btn-icon modal-close-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = content;
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    // Add buttons
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class || 'btn-secondary'}`;
        button.textContent = btn.text;
        button.onclick = () => {
            if (typeof btn.onclick === 'function') {
                btn.onclick();
            } else if (typeof btn.onclick === 'string') {
                eval(btn.onclick);
            }
        };
        footer.appendChild(button);
    });
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // Close button handler
    header.querySelector('.modal-close-btn').onclick = () => modal.remove();
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.getElementById('modalContainer').appendChild(modal);
    return modal;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format currency
function formatCurrency(amount) {
    if (!amount) return 'ETB 0.00';
    return 'ETB ' + new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Show loading
function showLoading() {
    return '<div class="spinner"></div>';
}

// Show error
function showError(message) {
    return `<div class="card"><p style="text-align: center; color: var(--danger-color);">${message}</p></div>`;
}

// Close modal helper
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}

// Check if user has permission
function hasPermission(requiredRoles) {
    if (!state.user) return false;
    return requiredRoles.includes(state.user.role);
}

// Check if user can edit/delete
function canModify(module) {
    const permissions = {
        assets: ['admin', 'asset_manager'],
        inventory: ['admin', 'inventory_manager'],
        employees: ['admin', 'hr_manager'],
        clients: ['admin', 'client_manager'],
        rentals: ['admin', 'asset_manager'],
        users: ['admin']
    };
    return hasPermission(permissions[module] || []);
}

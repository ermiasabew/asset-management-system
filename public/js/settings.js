// Settings and Profile Management

// Load settings page
async function loadSettings() {
    console.log('Loading settings page...');
    document.getElementById('contentArea').innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-cog"></i> Settings</h1>
        </div>

        <div style="max-width: 1200px;">
            <!-- Settings Tabs -->
            <div class="tabs" style="margin-bottom: 24px;">
                <button class="tab-btn active" onclick="showSettingsTab('profile')">
                    <i class="fas fa-user"></i> Profile
                </button>
                <button class="tab-btn" onclick="showSettingsTab('security')">
                    <i class="fas fa-shield-alt"></i> Security
                </button>
                ${hasPermission(['admin']) ? `
                    <button class="tab-btn" onclick="showSettingsTab('company')">
                        <i class="fas fa-building"></i> Company
                    </button>
                    <button class="tab-btn" onclick="showSettingsTab('system')">
                        <i class="fas fa-server"></i> System
                    </button>
                ` : ''}
            </div>

            <!-- Tab Content -->
            <div id="settingsTabContent"></div>
        </div>
    `;

    showSettingsTab('profile');
}

// Show specific settings tab
async function showSettingsTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event?.target?.closest('.tab-btn')?.classList.add('active');

    const content = document.getElementById('settingsTabContent');

    switch(tab) {
        case 'profile':
            await loadProfileTab(content);
            break;
        case 'security':
            await loadSecurityTab(content);
            break;
        case 'company':
            await loadCompanyTab(content);
            break;
        case 'system':
            await loadSystemTab(content);
            break;
    }
}

// Profile Tab
async function loadProfileTab(content) {
    try {
        const user = await apiRequest('/auth/me');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-user-circle"></i> My Profile</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <!-- Profile Info -->
                        <div>
                            <h4 style="margin-bottom: 16px;">Profile Information</h4>
                            <form id="profileForm">
                                <div class="form-group">
                                    <label>Username</label>
                                    <input type="text" value="${user.username}" disabled style="background: var(--bg-secondary);">
                                </div>
                                <div class="form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="full_name" value="${user.full_name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value="${user.email || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Phone</label>
                                    <input type="tel" name="phone" value="${user.phone || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Role</label>
                                    <input type="text" value="${user.role}" disabled style="background: var(--bg-secondary);">
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Update Profile
                                </button>
                            </form>
                        </div>

                        <!-- Change Password -->
                        <div>
                            <h4 style="margin-bottom: 16px;">Change Password</h4>
                            <form id="changePasswordForm">
                                <div class="form-group">
                                    <label>Current Password *</label>
                                    <input type="password" name="current_password" required>
                                </div>
                                <div class="form-group">
                                    <label>New Password *</label>
                                    <input type="password" name="new_password" required minlength="6">
                                    <small style="color: var(--text-secondary);">Minimum 6 characters</small>
                                </div>
                                <div class="form-group">
                                    <label>Confirm New Password *</label>
                                    <input type="password" name="confirm_password" required minlength="6">
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-key"></i> Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Profile form handler
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                await apiRequest('/auth/profile', {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                alert('Profile updated successfully!');
                // Update state
                state.user = { ...state.user, ...data };
            } catch (error) {
                alert('Failed to update profile: ' + error.message);
            }
        });

        // Change password form handler
        document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            if (data.new_password !== data.confirm_password) {
                alert('New passwords do not match!');
                return;
            }
            
            try {
                await apiRequest('/auth/change-password', {
                    method: 'POST',
                    body: JSON.stringify({
                        current_password: data.current_password,
                        new_password: data.new_password
                    })
                });
                alert('Password changed successfully!');
                e.target.reset();
            } catch (error) {
                alert('Failed to change password: ' + error.message);
            }
        });
    } catch (error) {
        content.innerHTML = `<div class="card"><div class="card-body">Error loading profile: ${error.message}</div></div>`;
    }
}

// Security Tab
async function loadSecurityTab(content) {
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-shield-alt"></i> Security Settings</h3>
            </div>
            <div class="card-body">
                <div style="max-width: 600px;">
                    <h4 style="margin-bottom: 16px;">Active Sessions</h4>
                    <div style="padding: 16px; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Current Session</strong>
                                <br><small style="color: var(--text-secondary);">Last activity: Just now</small>
                            </div>
                            <span class="badge success">Active</span>
                        </div>
                    </div>

                    <h4 style="margin-bottom: 16px;">Security Options</h4>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="twoFactorAuth" style="margin-right: 8px;">
                            <span>Enable Two-Factor Authentication (Coming Soon)</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="emailNotifications" checked style="margin-right: 8px;">
                            <span>Email notifications for security events</span>
                        </label>
                    </div>

                    <button class="btn btn-danger" onclick="logoutAllDevices()">
                        <i class="fas fa-sign-out-alt"></i> Logout All Devices
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Company Tab (Admin only)
async function loadCompanyTab(content) {
    if (!hasPermission(['admin'])) {
        content.innerHTML = `<div class="card"><div class="card-body">Access denied</div></div>`;
        return;
    }

    try {
        const settings = await apiRequest('/settings/company');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-building"></i> Company Information</h3>
                </div>
                <div class="card-body">
                    <form id="companyForm">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Company Name *</label>
                                <input type="text" name="company_name" value="${settings.company_name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Business Type</label>
                                <input type="text" name="business_type" value="${settings.business_type || ''}">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="company_email" value="${settings.company_email || ''}">
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" name="company_phone" value="${settings.company_phone || ''}">
                            </div>
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>Address</label>
                                <textarea name="company_address" rows="2">${settings.company_address || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Tax ID / TIN</label>
                                <input type="text" name="tax_id" value="${settings.tax_id || ''}">
                            </div>
                            <div class="form-group">
                                <label>Registration Number</label>
                                <input type="text" name="registration_number" value="${settings.registration_number || ''}">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Company Info
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('companyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                await apiRequest('/settings/company', {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                alert('Company information updated successfully!');
            } catch (error) {
                alert('Failed to update company info: ' + error.message);
            }
        });
    } catch (error) {
        content.innerHTML = `<div class="card"><div class="card-body">Error loading company settings: ${error.message}</div></div>`;
    }
}

// System Tab (Admin only)
async function loadSystemTab(content) {
    if (!hasPermission(['admin'])) {
        content.innerHTML = `<div class="card"><div class="card-body">Access denied</div></div>`;
        return;
    }

    try {
        const settings = await apiRequest('/settings/system');
        
        content.innerHTML = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3><i class="fas fa-sliders-h"></i> System Preferences</h3>
                </div>
                <div class="card-body">
                    <form id="systemForm">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Currency</label>
                                <select name="currency">
                                    <option value="ETB" ${settings.currency === 'ETB' ? 'selected' : ''}>ETB (Ethiopian Birr)</option>
                                    <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD (US Dollar)</option>
                                    <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (Euro)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Date Format</label>
                                <select name="date_format">
                                    <option value="YYYY-MM-DD" ${settings.date_format === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                                    <option value="DD/MM/YYYY" ${settings.date_format === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY" ${settings.date_format === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Time Zone</label>
                                <select name="timezone">
                                    <option value="Africa/Addis_Ababa" ${settings.timezone === 'Africa/Addis_Ababa' ? 'selected' : ''}>East Africa Time (EAT)</option>
                                    <option value="UTC" ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Items Per Page</label>
                                <input type="number" name="items_per_page" value="${settings.items_per_page || 10}" min="5" max="100">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save System Settings
                        </button>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-database"></i> Backup & Restore</h3>
                </div>
                <div class="card-body">
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin-bottom: 8px;">Create Backup</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 12px;">
                            Download a complete backup including database and all uploaded files (documents, photos, etc.)
                        </p>
                        <button class="btn btn-primary" onclick="backupDatabase()">
                            <i class="fas fa-download"></i> Download Complete Backup
                        </button>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
                        <h4 style="margin-bottom: 8px;">Restore from Backup</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 12px;">
                            Upload a backup file to restore your data (Coming Soon)
                        </p>
                        <button class="btn btn-secondary" disabled>
                            <i class="fas fa-upload"></i> Restore Backup (Coming Soon)
                        </button>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
                        <h4 style="margin-bottom: 8px;">Maintenance</h4>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <button class="btn btn-warning" onclick="clearCache()">
                                <i class="fas fa-broom"></i> Clear Cache
                            </button>
                            <button class="btn btn-info" onclick="viewSystemLogs()">
                                <i class="fas fa-file-alt"></i> View System Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('systemForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                await apiRequest('/settings/system', {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                alert('System settings updated successfully!');
            } catch (error) {
                alert('Failed to update system settings: ' + error.message);
            }
        });
    } catch (error) {
        content.innerHTML = `<div class="card"><div class="card-body">Error loading system settings: ${error.message}</div></div>`;
    }
}

// Logout all devices
async function logoutAllDevices() {
    if (!confirm('This will log you out from all devices. Continue?')) {
        return;
    }
    
    try {
        await apiRequest('/auth/logout-all', { method: 'POST' });
        alert('Logged out from all devices');
        logout();
    } catch (error) {
        alert('Failed to logout: ' + error.message);
    }
}

// Backup database and files
async function backupDatabase() {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating backup...';
        
        const response = await fetch(`${API_URL}/settings/backup`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (!response.ok) throw new Error('Backup failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        btn.innerHTML = '<i class="fas fa-check"></i> Backup downloaded!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
        
        showModal('Backup Complete', `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-check-circle" style="font-size: 48px; color: var(--success-color); margin-bottom: 16px;"></i>
                <h3>Backup Downloaded Successfully!</h3>
                <p style="color: var(--text-secondary); margin-top: 12px;">
                    Your complete backup has been downloaded as a ZIP file.<br>
                    It includes:
                </p>
                <ul style="text-align: left; max-width: 400px; margin: 16px auto;">
                    <li>Database with all records</li>
                    <li>All uploaded documents</li>
                    <li>Employee photos</li>
                    <li>Asset images</li>
                    <li>Guarantor documents</li>
                </ul>
                <p style="color: var(--warning-color); margin-top: 16px;">
                    <i class="fas fa-exclamation-triangle"></i> Store this backup in a safe location!
                </p>
            </div>
        `, [
            { text: 'Close', class: 'btn-primary', onclick: closeModal }
        ]);
    } catch (error) {
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Failed to create backup: ' + error.message);
    }
}

// Clear cache
async function clearCache() {
    if (!confirm('Clear all cached data?')) return;
    
    try {
        await apiRequest('/settings/clear-cache', { method: 'POST' });
        alert('Cache cleared successfully!');
    } catch (error) {
        alert('Failed to clear cache: ' + error.message);
    }
}

// View system logs
function viewSystemLogs() {
    showModal('System Logs', `
        <div style="max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 12px; background: var(--bg-secondary); padding: 12px; border-radius: 4px;">
            <div>Loading logs...</div>
        </div>
    `, [
        { text: 'Close', class: 'btn-secondary', onclick: closeModal }
    ]);
    
    // Load logs
    apiRequest('/settings/logs').then(logs => {
        document.querySelector('.modal-body').innerHTML = `
            <div style="max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 12px; background: var(--bg-secondary); padding: 12px; border-radius: 4px;">
                ${logs.map(log => `<div>${log}</div>`).join('')}
            </div>
        `;
    }).catch(error => {
        document.querySelector('.modal-body').innerHTML = `<div>Error loading logs: ${error.message}</div>`;
    });
}

async function loadUsers() {
    const content = document.getElementById('contentArea');
    content.innerHTML = showLoading();
    
    try {
        const users = await apiRequest('/auth/users');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">User Management</h3>
                    ${canModify('users') ? `
                        <button class="btn btn-primary" onclick="showAddUserModal()">
                            <i class="fas fa-plus"></i> Add User
                        </button>
                    ` : ''}
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td><strong>${user.username}</strong></td>
                                    <td>${user.full_name || '-'}</td>
                                    <td>${user.email || '-'}</td>
                                    <td><span class="badge info">${getRoleLabel(user.role)}</span></td>
                                    <td><span class="badge ${user.status === 'active' ? 'success' : 'danger'}">${user.status}</span></td>
                                    <td>${formatDate(user.created_at)}</td>
                                    <td class="action-buttons">
                                        ${canModify('users') ? `
                                            <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            ${user.username !== 'admin' ? `
                                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}, '${user.username}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Role Descriptions</h3>
                </div>
                <div style="display: grid; gap: 12px;">
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                        <strong>👑 Admin:</strong> Full system access, can manage all modules and users
                    </div>
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                        <strong>📦 Asset Manager:</strong> Manage assets and rental properties
                    </div>
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                        <strong>📊 Inventory Manager:</strong> Manage inventory, stock, and suppliers
                    </div>
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                        <strong>👥 HR Manager:</strong> Manage employees, documents, and guarantors
                    </div>
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                        <strong>🤝 Client Manager:</strong> Manage clients, contracts, and assignments
                    </div>
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                        <strong>💰 Accountant:</strong> View reports, record payments (read-only for most data)
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = showError('Failed to load users. ' + error.message);
    }
}

function getRoleLabel(role) {
    const labels = {
        'admin': 'Admin',
        'asset_manager': 'Asset Manager',
        'inventory_manager': 'Inventory Manager',
        'hr_manager': 'HR Manager',
        'client_manager': 'Client Manager',
        'accountant': 'Accountant'
    };
    return labels[role] || role;
}

function showAddUserModal() {
    showModal('Add New User', `
        <form id="addUserForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Username *</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" required minlength="6">
                    <small style="color: var(--text-secondary);">Minimum 6 characters</small>
                </div>
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="full_name">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email">
            </div>
            <div class="form-group">
                <label>Role *</label>
                <select name="role" required>
                    <option value="">Select Role</option>
                    <option value="admin">👑 Admin (Full Access)</option>
                    <option value="asset_manager">📦 Asset Manager</option>
                    <option value="inventory_manager">📊 Inventory Manager</option>
                    <option value="hr_manager">👥 HR Manager</option>
                    <option value="client_manager">🤝 Client Manager</option>
                    <option value="accountant">💰 Accountant</option>
                </select>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' },
        { text: 'Create User', class: 'btn-primary', onclick: 'submitUserForm()' }
    ]);
}

async function submitUserForm() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest('/auth/users', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadUsers();
        alert('User created successfully!');
    } catch (error) {
        alert('Failed to create user: ' + error.message);
    }
}

async function editUser(id) {
    try {
        const users = await apiRequest('/auth/users');
        const user = users.find(u => u.id === id);
        
        if (!user) {
            alert('User not found');
            return;
        }
        
        showModal(`Edit User: ${user.username}`, `
            <form id="editUserForm">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="${user.username}" disabled>
                    <small style="color: var(--text-secondary);">Username cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" value="${user.full_name || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${user.email || ''}">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select name="role" required>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
                        <option value="asset_manager" ${user.role === 'asset_manager' ? 'selected' : ''}>📦 Asset Manager</option>
                        <option value="inventory_manager" ${user.role === 'inventory_manager' ? 'selected' : ''}>📊 Inventory Manager</option>
                        <option value="hr_manager" ${user.role === 'hr_manager' ? 'selected' : ''}>👥 HR Manager</option>
                        <option value="client_manager" ${user.role === 'client_manager' ? 'selected' : ''}>🤝 Client Manager</option>
                        <option value="accountant" ${user.role === 'accountant' ? 'selected' : ''}>💰 Accountant</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" required>
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' },
            { text: 'Update User', class: 'btn-primary', onclick: `submitEditUserForm(${id})` }
        ]);
    } catch (error) {
        alert('Failed to load user details');
    }
}

async function submitEditUserForm(id) {
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/auth/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadUsers();
        alert('User updated successfully!');
    } catch (error) {
        alert('Failed to update user: ' + error.message);
    }
}

async function deleteUser(id, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        return;
    }
    
    console.log('Attempting to delete user:', id, username);
    
    try {
        const response = await apiRequest(`/auth/users/${id}`, {
            method: 'DELETE'
        });
        
        console.log('Delete response:', response);
        alert('User deleted successfully!');
        loadUsers();
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete user: ' + error.message);
    }
}

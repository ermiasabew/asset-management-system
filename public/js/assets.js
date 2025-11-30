// Store assets data globally
let allAssets = [];
let assetFilters = {
    category: '',
    status: '',
    search: ''
};

// Debounce timer for search
let assetSearchDebounceTimer = null;

async function loadAssets() {
    const content = document.getElementById('contentArea');
    
    // Get current filter values BEFORE clearing content
    const categoryEl = document.getElementById('assetCategoryFilter');
    const statusEl = document.getElementById('assetStatusFilter');
    const searchEl = document.getElementById('assetSearch');
    
    // Remember if search had focus
    const searchHadFocus = searchEl && document.activeElement === searchEl;
    const cursorPosition = searchEl ? searchEl.selectionStart : 0;
    
    if (categoryEl) assetFilters.category = categoryEl.value;
    if (statusEl) assetFilters.status = statusEl.value;
    if (searchEl) assetFilters.search = searchEl.value;
    
    content.innerHTML = showLoading();
    
    try {
        allAssets = await apiRequest('/assets');
        renderAssets();
        
        // Restore focus and cursor position if search had focus
        if (searchHadFocus) {
            const newSearchEl = document.getElementById('assetSearch');
            if (newSearchEl) {
                newSearchEl.focus();
                newSearchEl.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    } catch (error) {
        content.innerHTML = showError('Failed to load assets');
    }
}

function renderAssets() {
    const content = document.getElementById('contentArea');
    
    // Remember if search had focus
    const searchEl = document.getElementById('assetSearch');
    const searchHadFocus = searchEl && document.activeElement === searchEl;
    const cursorPosition = searchEl ? searchEl.selectionStart : 0;
    
    // Apply filters
    let filteredAssets = allAssets.filter(asset => {
        if (assetFilters.category && asset.category !== assetFilters.category) return false;
        if (assetFilters.status && asset.status !== assetFilters.status) return false;
        if (assetFilters.search) {
            const search = assetFilters.search.toLowerCase();
            return asset.asset_code.toLowerCase().includes(search) ||
                   asset.name.toLowerCase().includes(search) ||
                   (asset.location && asset.location.toLowerCase().includes(search));
        }
        return true;
    });
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Asset Management</h3>
                ${canModify('assets') ? `
                    <button class="btn btn-primary" onclick="showAddAssetModal()">
                        <i class="fas fa-plus"></i> Add Asset
                    </button>
                ` : ''}
            </div>
            
            <div class="filter-bar">
                <select id="assetCategoryFilter" onchange="filterAssets()">
                    <option value="">All Categories</option>
                    <option value="Building" ${assetFilters.category === 'Building' ? 'selected' : ''}>Building</option>
                    <option value="Car" ${assetFilters.category === 'Car' ? 'selected' : ''}>Car</option>
                    <option value="House" ${assetFilters.category === 'House' ? 'selected' : ''}>House</option>
                    <option value="Property" ${assetFilters.category === 'Property' ? 'selected' : ''}>Property</option>
                    <option value="Office Item" ${assetFilters.category === 'Office Item' ? 'selected' : ''}>Office Item</option>
                    <option value="Machine" ${assetFilters.category === 'Machine' ? 'selected' : ''}>Machine</option>
                </select>
                <select id="assetStatusFilter" onchange="filterAssets()">
                    <option value="">All Status</option>
                    <option value="available" ${assetFilters.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="assigned" ${assetFilters.status === 'assigned' ? 'selected' : ''}>Assigned</option>
                    <option value="rented" ${assetFilters.status === 'rented' ? 'selected' : ''}>Rented</option>
                    <option value="maintenance" ${assetFilters.status === 'maintenance' ? 'selected' : ''}>Under Maintenance</option>
                    <option value="damaged" ${assetFilters.status === 'damaged' ? 'selected' : ''}>Damaged</option>
                </select>
                <input type="text" id="assetSearch" placeholder="Search assets..." oninput="debouncedAssetSearch()" value="${assetFilters.search}">
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Asset Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Purchase Price</th>
                            <th>Current Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="assetTableBody">
                        ${filteredAssets.map(asset => `
                            <tr>
                                <td>${asset.asset_code}</td>
                                <td>${asset.name}</td>
                                <td>${asset.category}</td>
                                <td><span class="badge ${getStatusClass(asset.status)}">${asset.status}</span></td>
                                <td>${asset.location || '-'}</td>
                                <td>${formatCurrency(asset.purchase_price)}</td>
                                <td>${formatCurrency(asset.current_value)}</td>
                                <td class="action-buttons">
                                    <button class="btn btn-sm btn-primary" onclick="viewAsset(${asset.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${canModify('assets') ? `
                                        <button class="btn btn-sm btn-secondary" onclick="editAsset(${asset.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteAsset(${asset.id}, '${asset.name}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Restore focus and cursor position if search had focus
    if (searchHadFocus) {
        const newSearchEl = document.getElementById('assetSearch');
        if (newSearchEl) {
            newSearchEl.focus();
            newSearchEl.setSelectionRange(cursorPosition, cursorPosition);
        }
    }
}

function getStatusClass(status) {
    const classes = {
        'available': 'success',
        'assigned': 'info',
        'rented': 'info',
        'maintenance': 'warning',
        'damaged': 'danger'
    };
    return classes[status] || 'info';
}

function showAddAssetModal() {
    const modal = showModal('Add New Asset', `
        <form id="addAssetForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Asset Code *</label>
                    <input type="text" name="asset_code" required>
                </div>
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Category *</label>
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="Building">Building</option>
                        <option value="Car">Car</option>
                        <option value="House">House</option>
                        <option value="Property">Property</option>
                        <option value="Office Item">Office Item</option>
                        <option value="Machine">Machine</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="available">Available</option>
                        <option value="assigned">Assigned</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Under Maintenance</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Purchase Date</label>
                    <input type="date" name="purchase_date">
                </div>
                <div class="form-group">
                    <label>Purchase Price</label>
                    <input type="number" name="purchase_price" step="0.01">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Current Value</label>
                    <input type="number" name="current_value" step="0.01">
                </div>
                <div class="form-group">
                    <label>Depreciation Rate (%)</label>
                    <input type="number" name="depreciation_rate" step="0.01">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location">
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <input type="text" name="department">
                </div>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
        { text: 'Save Asset', class: 'btn-primary', onclick: 'submitAssetForm()' }
    ]);
}

async function submitAssetForm() {
    const form = document.getElementById('addAssetForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest('/assets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadAssets();
    } catch (error) {
        alert('Failed to create asset: ' + error.message);
    }
}

async function viewAsset(id) {
    try {
        const asset = await apiRequest(`/assets/${id}`);
        
        showModal(`Asset Details: ${asset.name}`, `
            <div style="display: grid; gap: 16px;">
                <div><strong>Asset Code:</strong> ${asset.asset_code}</div>
                <div><strong>Category:</strong> ${asset.category}</div>
                <div><strong>Status:</strong> <span class="badge ${getStatusClass(asset.status)}">${asset.status}</span></div>
                <div><strong>Description:</strong> ${asset.description || '-'}</div>
                <div><strong>Purchase Date:</strong> ${formatDate(asset.purchase_date)}</div>
                <div><strong>Purchase Price:</strong> ${formatCurrency(asset.purchase_price)}</div>
                <div><strong>Current Value:</strong> ${formatCurrency(asset.current_value)}</div>
                <div><strong>Location:</strong> ${asset.location || '-'}</div>
                <div><strong>Department:</strong> ${asset.department || '-'}</div>
                <div><strong>Condition:</strong> ${asset.condition || '-'}</div>
                ${asset.history && asset.history.length > 0 ? `
                    <div>
                        <strong>History:</strong>
                        <ul style="margin-top: 8px;">
                            ${asset.history.slice(0, 5).map(h => `
                                <li>${h.action} - ${formatDate(h.performed_at)}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() }
        ]);
    } catch (error) {
        alert('Failed to load asset details');
    }
}

function filterAssets() {
    const categoryEl = document.getElementById('assetCategoryFilter');
    const statusEl = document.getElementById('assetStatusFilter');
    const searchEl = document.getElementById('assetSearch');
    
    if (categoryEl) assetFilters.category = categoryEl.value;
    if (statusEl) assetFilters.status = statusEl.value;
    if (searchEl) assetFilters.search = searchEl.value;
    
    renderAssets();
}

function debouncedAssetSearch() {
    const searchEl = document.getElementById('assetSearch');
    if (searchEl) assetFilters.search = searchEl.value;
    
    // Clear existing timer
    if (assetSearchDebounceTimer) {
        clearTimeout(assetSearchDebounceTimer);
    }
    
    // Set new timer
    assetSearchDebounceTimer = setTimeout(() => {
        renderAssets();
    }, 300);
}

async function editAsset(id) {
    try {
        const asset = await apiRequest(`/assets/${id}`);
        
        showModal('Edit Asset', `
            <form id="editAssetForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Asset Code *</label>
                        <input type="text" name="asset_code" value="${asset.asset_code}" required>
                    </div>
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value="${asset.name}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category *</label>
                        <select name="category" required>
                            <option value="">Select Category</option>
                            <option value="Building" ${asset.category === 'Building' ? 'selected' : ''}>Building</option>
                            <option value="Car" ${asset.category === 'Car' ? 'selected' : ''}>Car</option>
                            <option value="House" ${asset.category === 'House' ? 'selected' : ''}>House</option>
                            <option value="Property" ${asset.category === 'Property' ? 'selected' : ''}>Property</option>
                            <option value="Office Item" ${asset.category === 'Office Item' ? 'selected' : ''}>Office Item</option>
                            <option value="Machine" ${asset.category === 'Machine' ? 'selected' : ''}>Machine</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="available" ${asset.status === 'available' ? 'selected' : ''}>Available</option>
                            <option value="assigned" ${asset.status === 'assigned' ? 'selected' : ''}>Assigned</option>
                            <option value="rented" ${asset.status === 'rented' ? 'selected' : ''}>Rented</option>
                            <option value="maintenance" ${asset.status === 'maintenance' ? 'selected' : ''}>Under Maintenance</option>
                            <option value="damaged" ${asset.status === 'damaged' ? 'selected' : ''}>Damaged</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="3">${asset.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Purchase Date</label>
                        <input type="date" name="purchase_date" value="${asset.purchase_date ? asset.purchase_date.split('T')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label>Purchase Price</label>
                        <input type="number" name="purchase_price" step="0.01" value="${asset.purchase_price || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Current Value</label>
                        <input type="number" name="current_value" step="0.01" value="${asset.current_value || ''}">
                    </div>
                    <div class="form-group">
                        <label>Depreciation Rate (%)</label>
                        <input type="number" name="depreciation_rate" step="0.01" value="${asset.depreciation_rate || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value="${asset.location || ''}">
                    </div>
                    <div class="form-group">
                        <label>Department</label>
                        <input type="text" name="department" value="${asset.department || ''}">
                    </div>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
            { text: 'Update Asset', class: 'btn-primary', onclick: `submitEditAssetForm(${id})` }
        ]);
    } catch (error) {
        alert('Failed to load asset: ' + error.message);
    }
}

async function submitEditAssetForm(id) {
    const form = document.getElementById('editAssetForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/assets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadAssets();
    } catch (error) {
        alert('Failed to update asset: ' + error.message);
    }
}

async function deleteAsset(id, name) {
    if (!confirm(`Are you sure you want to delete asset "${name}"?`)) {
        return;
    }
    
    try {
        await apiRequest(`/assets/${id}`, {
            method: 'DELETE'
        });
        
        loadAssets();
    } catch (error) {
        alert('Failed to delete asset: ' + error.message);
    }
}

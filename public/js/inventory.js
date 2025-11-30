// Store inventory data globally
let allInventoryItems = [];
let inventoryFilters = {
    category: '',
    status: '',
    lowStock: false
};

async function loadInventory() {
    const content = document.getElementById('contentArea');
    
    // Get current filter values BEFORE clearing content
    const categoryEl = document.getElementById('inventoryCategoryFilter');
    const statusEl = document.getElementById('inventoryStatusFilter');
    const lowStockEl = document.getElementById('lowStockFilter');
    
    if (categoryEl) inventoryFilters.category = categoryEl.value;
    if (statusEl) inventoryFilters.status = statusEl.value;
    if (lowStockEl) inventoryFilters.lowStock = lowStockEl.checked;
    
    content.innerHTML = showLoading();
    
    try {
        allInventoryItems = await apiRequest('/inventory');
        renderInventory();
    } catch (error) {
        content.innerHTML = showError('Failed to load inventory');
    }
}

function renderInventory() {
    const content = document.getElementById('contentArea');
    
    // Remember if any filter had focus (inventory doesn't have search, but keeping pattern consistent)
    
    // Apply filters
    let filteredItems = allInventoryItems.filter(item => {
        if (inventoryFilters.category && item.category !== inventoryFilters.category) return false;
        if (inventoryFilters.status && item.status !== inventoryFilters.status) return false;
        if (inventoryFilters.lowStock && item.current_stock > item.min_stock) return false;
        return true;
    });
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Inventory Management</h3>
                ${canModify('inventory') ? `
                    <button class="btn btn-primary" onclick="showAddInventoryModal()">
                        <i class="fas fa-plus"></i> Add Item
                    </button>
                ` : ''}
            </div>
            
            <div class="filter-bar">
                <select id="inventoryCategoryFilter" onchange="filterInventory()">
                    <option value="">All Categories</option>
                    <option value="Cleaning Materials" ${inventoryFilters.category === 'Cleaning Materials' ? 'selected' : ''}>Cleaning Materials</option>
                    <option value="Security Equipment" ${inventoryFilters.category === 'Security Equipment' ? 'selected' : ''}>Security Equipment</option>
                    <option value="Office Supplies" ${inventoryFilters.category === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
                    <option value="Tools" ${inventoryFilters.category === 'Tools' ? 'selected' : ''}>Tools</option>
                    <option value="Uniforms" ${inventoryFilters.category === 'Uniforms' ? 'selected' : ''}>Uniforms</option>
                </select>
                <select id="inventoryStatusFilter" onchange="filterInventory()">
                    <option value="">All Status</option>
                    <option value="active" ${inventoryFilters.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${inventoryFilters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="lowStockFilter" onchange="filterInventory()" ${inventoryFilters.lowStock ? 'checked' : ''}>
                    Low Stock Only
                </label>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Min Stock</th>
                            <th>Unit Price</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredItems.map(item => `
                            <tr style="${item.current_stock <= item.min_stock ? 'background: #fef3c7;' : ''}">
                                <td>${item.item_code}</td>
                                <td>${item.name}</td>
                                <td>${item.category}</td>
                                <td>
                                    ${item.current_stock} ${item.unit || ''}
                                    ${item.current_stock <= item.min_stock ? '<i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>' : ''}
                                </td>
                                <td>${item.min_stock} ${item.unit || ''}</td>
                                <td>${formatCurrency(item.unit_price)}</td>
                                <td>${item.location || '-'}</td>
                                <td class="action-buttons">
                                    <button class="btn btn-sm btn-primary" onclick="viewInventoryItem(${item.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${canModify('inventory') ? `
                                        <button class="btn btn-sm btn-secondary" onclick="editInventoryItem(${item.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="showStockTransaction(${item.id}, 'in')">
                                            <i class="fas fa-plus"></i> In
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="showStockTransaction(${item.id}, 'out')">
                                            <i class="fas fa-minus"></i> Out
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${item.id}, '${item.name}')">
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
}

function showAddInventoryModal() {
    showModal('Add Inventory Item', `
        <form id="addInventoryForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Item Code *</label>
                    <input type="text" name="item_code" required>
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
                        <option value="Cleaning Materials">Cleaning Materials</option>
                        <option value="Security Equipment">Security Equipment</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Tools">Tools</option>
                        <option value="Uniforms">Uniforms</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <input type="text" name="unit" placeholder="e.g., pcs, kg, liters">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="2"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Current Stock</label>
                    <input type="number" name="current_stock" value="0">
                </div>
                <div class="form-group">
                    <label>Min Stock</label>
                    <input type="number" name="min_stock" value="0">
                </div>
                <div class="form-group">
                    <label>Max Stock</label>
                    <input type="number" name="max_stock">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Unit Price</label>
                    <input type="number" name="unit_price" step="0.01">
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location">
                </div>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
        { text: 'Save Item', class: 'btn-primary', onclick: 'submitInventoryForm()' }
    ]);
}

async function submitInventoryForm() {
    const form = document.getElementById('addInventoryForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest('/inventory', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadInventory();
    } catch (error) {
        alert('Failed to create item: ' + error.message);
    }
}

function showStockTransaction(itemId, type) {
    showModal(`Stock ${type === 'in' ? 'In' : 'Out'}`, `
        <form id="stockTransactionForm">
            <input type="hidden" name="transaction_type" value="${type}">
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" name="quantity" min="1" required>
            </div>
            <div class="form-group">
                <label>Reference No</label>
                <input type="text" name="reference_no">
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3"></textarea>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
        { text: 'Submit', class: 'btn-primary', onclick: `submitStockTransaction(${itemId})` }
    ]);
}

async function submitStockTransaction(itemId) {
    const form = document.getElementById('stockTransactionForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.quantity = parseInt(data.quantity);
    
    try {
        await apiRequest(`/inventory/${itemId}/transaction`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadInventory();
    } catch (error) {
        alert('Failed to record transaction: ' + error.message);
    }
}

async function viewInventoryItem(id) {
    try {
        const item = await apiRequest(`/inventory/${id}`);
        
        showModal(`Item Details: ${item.name}`, `
            <div style="display: grid; gap: 16px;">
                <div><strong>Item Code:</strong> ${item.item_code}</div>
                <div><strong>Category:</strong> ${item.category}</div>
                <div><strong>Current Stock:</strong> ${item.current_stock} ${item.unit || ''}</div>
                <div><strong>Min Stock:</strong> ${item.min_stock} ${item.unit || ''}</div>
                <div><strong>Unit Price:</strong> ${formatCurrency(item.unit_price)}</div>
                <div><strong>Location:</strong> ${item.location || '-'}</div>
                ${item.transactions && item.transactions.length > 0 ? `
                    <div>
                        <strong>Recent Transactions:</strong>
                        <table style="width: 100%; margin-top: 8px;">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${item.transactions.slice(0, 10).map(t => `
                                    <tr>
                                        <td><span class="badge ${t.transaction_type === 'in' ? 'success' : 'danger'}">${t.transaction_type}</span></td>
                                        <td>${t.quantity}</td>
                                        <td>${formatDate(t.transaction_date)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() }
        ]);
    } catch (error) {
        alert('Failed to load item details');
    }
}

function filterInventory() {
    const categoryEl = document.getElementById('inventoryCategoryFilter');
    const statusEl = document.getElementById('inventoryStatusFilter');
    const lowStockEl = document.getElementById('lowStockFilter');
    
    if (categoryEl) inventoryFilters.category = categoryEl.value;
    if (statusEl) inventoryFilters.status = statusEl.value;
    if (lowStockEl) inventoryFilters.lowStock = lowStockEl.checked;
    
    renderInventory();
}

async function deleteInventoryItem(id, name) {
    if (!confirm(`Are you sure you want to delete inventory item "${name}"?`)) {
        return;
    }
    
    try {
        await apiRequest(`/inventory/${id}`, {
            method: 'DELETE'
        });
        
        loadInventory();
    } catch (error) {
        alert('Failed to delete item: ' + error.message);
    }
}

async function editInventoryItem(id) {
    try {
        const item = await apiRequest(`/inventory/${id}`);
        
        showModal('Edit Inventory Item', `
            <form id="editInventoryForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Item Code *</label>
                        <input type="text" name="item_code" value="${item.item_code}" required>
                    </div>
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value="${item.name}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category *</label>
                        <select name="category" required>
                            <option value="">Select Category</option>
                            <option value="Cleaning Materials" ${item.category === 'Cleaning Materials' ? 'selected' : ''}>Cleaning Materials</option>
                            <option value="Security Equipment" ${item.category === 'Security Equipment' ? 'selected' : ''}>Security Equipment</option>
                            <option value="Office Supplies" ${item.category === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
                            <option value="Tools" ${item.category === 'Tools' ? 'selected' : ''}>Tools</option>
                            <option value="Uniforms" ${item.category === 'Uniforms' ? 'selected' : ''}>Uniforms</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Unit</label>
                        <input type="text" name="unit" value="${item.unit || ''}" placeholder="e.g., pcs, kg, liters">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="2">${item.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Min Stock</label>
                        <input type="number" name="min_stock" value="${item.min_stock || 0}">
                    </div>
                    <div class="form-group">
                        <label>Max Stock</label>
                        <input type="number" name="max_stock" value="${item.max_stock || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Unit Price</label>
                        <input type="number" name="unit_price" step="0.01" value="${item.unit_price || ''}">
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value="${item.location || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
            { text: 'Update Item', class: 'btn-primary', onclick: `submitEditInventoryForm(${id})` }
        ]);
    } catch (error) {
        alert('Failed to load item: ' + error.message);
    }
}

async function submitEditInventoryForm(id) {
    const form = document.getElementById('editInventoryForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/inventory/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadInventory();
    } catch (error) {
        alert('Failed to update item: ' + error.message);
    }
}

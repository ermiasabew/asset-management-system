async function loadRentals() {
    const content = document.getElementById('contentArea');
    content.innerHTML = showLoading();
    
    try {
        const properties = await apiRequest('/rentals');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Rental Properties</h3>
                    ${canModify('rentals') ? `
                        <button class="btn btn-primary" onclick="showAddPropertyModal()">
                            <i class="fas fa-plus"></i> Add Property
                        </button>
                    ` : ''}
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Property Code</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Address</th>
                                <th>Monthly Rent</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${properties.map(prop => `
                                <tr>
                                    <td>${prop.property_code}</td>
                                    <td>${prop.name}</td>
                                    <td>${prop.property_type}</td>
                                    <td>${prop.address || '-'}</td>
                                    <td>${formatCurrency(prop.monthly_rent)}</td>
                                    <td><span class="badge ${prop.status === 'available' ? 'success' : 'info'}">${prop.status}</span></td>
                                    <td class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="viewProperty(${prop.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = showError('Failed to load properties');
    }
}

function showAddPropertyModal() {
    showModal('Add Rental Property', `
        <form id="addPropertyForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Property Code *</label>
                    <input type="text" name="property_code" required>
                </div>
                <div class="form-group">
                    <label>Property Type *</label>
                    <select name="property_type" required>
                        <option value="">Select Type</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Shop">Shop</option>
                        <option value="Office">Office</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Size</label>
                    <input type="text" name="size" placeholder="e.g., 1200 sqft">
                </div>
                <div class="form-group">
                    <label>Rooms</label>
                    <input type="number" name="rooms">
                </div>
                <div class="form-group">
                    <label>Monthly Rent</label>
                    <input type="number" name="monthly_rent" step="0.01">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' },
        { text: 'Save Property', class: 'btn-primary', onclick: 'submitPropertyForm()' }
    ]);
}

async function submitPropertyForm() {
    const form = document.getElementById('addPropertyForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest('/rentals', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadRentals();
    } catch (error) {
        alert('Failed to create property: ' + error.message);
    }
}

async function viewProperty(id) {
    try {
        const property = await apiRequest(`/rentals/${id}`);
        
        showModal(`Property: ${property.name}`, `
            <div style="display: grid; gap: 16px;">
                <div><strong>Property Code:</strong> ${property.property_code}</div>
                <div><strong>Type:</strong> ${property.property_type}</div>
                <div><strong>Address:</strong> ${property.address || '-'}</div>
                <div><strong>Size:</strong> ${property.size || '-'}</div>
                <div><strong>Rooms:</strong> ${property.rooms || '-'}</div>
                <div><strong>Monthly Rent:</strong> ${formatCurrency(property.monthly_rent)}</div>
                <div><strong>Status:</strong> <span class="badge ${property.status === 'available' ? 'success' : 'info'}">${property.status}</span></div>
                <div><strong>Description:</strong> ${property.description || '-'}</div>
                
                ${property.tenants && property.tenants.length > 0 ? `
                    <div>
                        <strong>Tenants:</strong>
                        ${property.tenants.map(t => `
                            <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px; margin-top: 8px;">
                                <div><strong>${t.tenant_name}</strong></div>
                                <div>Phone: ${t.phone || '-'}</div>
                                <div>Contract: ${formatDate(t.contract_start)} - ${formatDate(t.contract_end)}</div>
                                <div>Rent: ${formatCurrency(t.monthly_rent)}</div>
                                <div>Status: <span class="badge ${t.status === 'active' ? 'success' : 'warning'}">${t.status}</span></div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${property.status === 'available' && canModify('rentals') ? `
                    <div style="margin-top: 16px;">
                        <button class="btn btn-primary" onclick="showAddTenantModal(${id})">
                            <i class="fas fa-plus"></i> Add Tenant
                        </button>
                    </div>
                ` : ''}
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' }
        ]);
    } catch (error) {
        alert('Failed to load property details');
    }
}

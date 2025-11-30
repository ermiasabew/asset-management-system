async function loadClients() {
    const content = document.getElementById('contentArea');
    content.innerHTML = showLoading();
    
    try {
        const clients = await apiRequest('/clients');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Client Management</h3>
                    ${canModify('clients') ? `
                        <button class="btn btn-primary" onclick="showAddClientModal()">
                            <i class="fas fa-plus"></i> Add Client
                        </button>
                    ` : ''}
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Client Code</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.map(client => `
                                <tr>
                                    <td>${client.client_code}</td>
                                    <td>${client.name}</td>
                                    <td>${client.type || '-'}</td>
                                    <td>${client.contact_person || '-'}</td>
                                    <td>${client.phone || '-'}</td>
                                    <td>${client.email || '-'}</td>
                                    <td><span class="badge ${client.status === 'active' ? 'success' : 'danger'}">${client.status}</span></td>
                                    <td class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="viewClient(${client.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        ${canModify('clients') ? `
                                            <button class="btn btn-sm btn-secondary" onclick="editClient(${client.id})">
                                                <i class="fas fa-edit"></i>
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
    } catch (error) {
        content.innerHTML = showError('Failed to load clients');
    }
}

function showAddClientModal() {
    showModal('Add New Client', `
        <form id="addClientForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Client Code *</label>
                    <input type="text" name="client_code" required>
                </div>
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="type">
                        <option value="">Select Type</option>
                        <option value="Company">Company</option>
                        <option value="Building">Building</option>
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Contact Person</label>
                    <input type="text" name="contact_person">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="3"></textarea>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' },
        { text: 'Save Client', class: 'btn-primary', onclick: 'submitClientForm()' }
    ]);
}

async function submitClientForm() {
    const form = document.getElementById('addClientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest('/clients', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadClients();
    } catch (error) {
        alert('Failed to create client: ' + error.message);
    }
}

async function viewClient(id) {
    try {
        const client = await apiRequest(`/clients/${id}`);
        
        showModal(`Client Details: ${client.name}`, `
            <div style="display: grid; gap: 16px;">
                <div><strong>Client Code:</strong> ${client.client_code}</div>
                <div><strong>Type:</strong> ${client.type || '-'}</div>
                <div><strong>Contact Person:</strong> ${client.contact_person || '-'}</div>
                <div><strong>Email:</strong> ${client.email || '-'}</div>
                <div><strong>Phone:</strong> ${client.phone || '-'}</div>
                <div><strong>Address:</strong> ${client.address || '-'}</div>
                <div><strong>Status:</strong> <span class="badge ${client.status === 'active' ? 'success' : 'danger'}">${client.status}</span></div>
                
                ${client.contracts && client.contracts.length > 0 ? `
                    <div>
                        <strong>Service Contracts:</strong>
                        <table style="width: 100%; margin-top: 8px;">
                            <thead>
                                <tr>
                                    <th>Contract #</th>
                                    <th>Service Type</th>
                                    <th>Monthly Fee</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${client.contracts.map(c => `
                                    <tr>
                                        <td>${c.contract_number}</td>
                                        <td>${c.service_type}</td>
                                        <td>${formatCurrency(c.monthly_fee)}</td>
                                        <td><span class="badge ${c.status === 'active' ? 'success' : 'warning'}">${c.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                ${client.assignments && client.assignments.length > 0 ? `
                    <div>
                        <strong>Assigned Employees:</strong>
                        <ul style="margin-top: 8px;">
                            ${client.assignments.filter(a => a.status === 'active').map(a => `
                                <li>${a.first_name} ${a.last_name} (${a.category}) - ${a.location}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${canModify('clients') ? `
                    <div style="margin-top: 16px;">
                        <button class="btn btn-primary" onclick="showAddContractModal(${id})">
                            <i class="fas fa-plus"></i> Add Contract
                        </button>
                        <button class="btn btn-secondary" onclick="showAssignEmployeeModal(${id})">
                            <i class="fas fa-user-plus"></i> Assign Employee
                        </button>
                    </div>
                ` : ''}
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' }
        ]);
    } catch (error) {
        alert('Failed to load client details');
    }
}

function showAddContractModal(clientId) {
    showModal('Add Service Contract', `
        <form id="addContractForm">
            <div class="form-group">
                <label>Contract Number *</label>
                <input type="text" name="contract_number" required>
            </div>
            <div class="form-group">
                <label>Service Type *</label>
                <select name="service_type" required>
                    <option value="">Select Service</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Security">Security</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Combined">Combined Services</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" name="start_date">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" name="end_date">
                </div>
            </div>
            <div class="form-group">
                <label>Monthly Fee</label>
                <input type="number" name="monthly_fee" step="0.01">
            </div>
            <div class="form-group">
                <label>Terms & Conditions</label>
                <textarea name="terms" rows="4"></textarea>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: 'this.closest(".modal").remove()' },
        { text: 'Save Contract', class: 'btn-primary', onclick: `submitContractForm(${clientId})` }
    ]);
}

async function submitContractForm(clientId) {
    const form = document.getElementById('addContractForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/clients/${clientId}/contracts`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        viewClient(clientId);
    } catch (error) {
        alert('Failed to create contract: ' + error.message);
    }
}

function editClient(id) {
    alert('Edit functionality - to be implemented');
}

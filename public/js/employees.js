// Store filter values globally
let employeeFilters = {
    category: '',
    status: '',
    docStatus: '',
    guarantee: '',
    search: ''
};

// Debounce timer for search
let searchDebounceTimer = null;

async function loadEmployees() {
    const content = document.getElementById('contentArea');
    
    // Get current filter values BEFORE clearing the content
    const categoryEl = document.getElementById('employeeCategoryFilter');
    const statusEl = document.getElementById('employeeStatusFilter');
    const docStatusEl = document.getElementById('employeeDocStatusFilter');
    const guaranteeEl = document.getElementById('employeeGuaranteeFilter');
    const searchEl = document.getElementById('employeeSearch');
    
    // Remember if search had focus
    const searchHadFocus = searchEl && document.activeElement === searchEl;
    const cursorPosition = searchEl ? searchEl.selectionStart : 0;
    
    if (categoryEl) employeeFilters.category = categoryEl.value;
    if (statusEl) employeeFilters.status = statusEl.value;
    if (docStatusEl) employeeFilters.docStatus = docStatusEl.value;
    if (guaranteeEl) employeeFilters.guarantee = guaranteeEl.value;
    if (searchEl) employeeFilters.search = searchEl.value;
    
    content.innerHTML = showLoading();
    
    try {
        // Build query string from stored filters
        const params = new URLSearchParams();
        if (employeeFilters.category) params.append('category', employeeFilters.category);
        if (employeeFilters.status) params.append('status', employeeFilters.status);
        if (employeeFilters.docStatus) params.append('docStatus', employeeFilters.docStatus);
        if (employeeFilters.guarantee) params.append('guarantee', employeeFilters.guarantee);
        if (employeeFilters.search) params.append('search', employeeFilters.search);
        
        const queryString = params.toString();
        const employees = await apiRequest(`/employees${queryString ? '?' + queryString : ''}`);
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Employee Management</h3>
                    <div style="display: flex; gap: 8px;">
                        ${canModify('employees') ? `
                            <button class="btn btn-success" onclick="showImportEmployeesModal()">
                                <i class="fas fa-upload"></i> Import CSV
                            </button>
                            <button class="btn btn-primary" onclick="showAddEmployeeModal()">
                                <i class="fas fa-plus"></i> Add Employee
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="exportEmployees()">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                
                <div class="filter-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
                    <select id="employeeCategoryFilter" onchange="filterEmployees()">
                        <option value="">All Categories</option>
                        <option value="Hygiene Worker" ${employeeFilters.category === 'Hygiene Worker' ? 'selected' : ''}>Hygiene Worker</option>
                        <option value="Security Guard" ${employeeFilters.category === 'Security Guard' ? 'selected' : ''}>Security Guard</option>
                        <option value="Technician" ${employeeFilters.category === 'Technician' ? 'selected' : ''}>Technician</option>
                        <option value="Driver" ${employeeFilters.category === 'Driver' ? 'selected' : ''}>Driver</option>
                        <option value="Admin Staff" ${employeeFilters.category === 'Admin Staff' ? 'selected' : ''}>Admin Staff</option>
                    </select>
                    <select id="employeeStatusFilter" onchange="filterEmployees()">
                        <option value="">All Status</option>
                        <option value="active" ${employeeFilters.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="on_leave" ${employeeFilters.status === 'on_leave' ? 'selected' : ''}>On Leave</option>
                        <option value="suspended" ${employeeFilters.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                        <option value="terminated" ${employeeFilters.status === 'terminated' ? 'selected' : ''}>Terminated</option>
                    </select>
                    <select id="employeeDocStatusFilter" onchange="filterEmployees()">
                        <option value="">All Documents</option>
                        <option value="complete" ${employeeFilters.docStatus === 'complete' ? 'selected' : ''}>Complete</option>
                        <option value="incomplete" ${employeeFilters.docStatus === 'incomplete' ? 'selected' : ''}>Incomplete</option>
                    </select>
                    <select id="employeeGuaranteeFilter" onchange="filterEmployees()">
                        <option value="">All Guarantees</option>
                        <option value="verified" ${employeeFilters.guarantee === 'verified' ? 'selected' : ''}>Verified</option>
                        <option value="expired" ${employeeFilters.guarantee === 'expired' ? 'selected' : ''}>Expired</option>
                        <option value="missing" ${employeeFilters.guarantee === 'missing' ? 'selected' : ''}>Missing</option>
                    </select>
                    <input type="text" id="employeeSearch" placeholder="Search employees..." oninput="filterEmployees(true)" value="${employeeFilters.search}">
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee Code</th>
                                <th>Full Name</th>
                                <th>Category</th>
                                <th>Position</th>
                                <th>Phone</th>
                                <th>National ID</th>
                                <th>Salary (ETB)</th>
                                <th>Bank Account</th>
                                <th>Hire Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map(emp => `
                                <tr>
                                    <td>${emp.employee_code}</td>
                                    <td>${emp.full_name || emp.first_name + ' ' + emp.last_name}</td>
                                    <td>${emp.category}</td>
                                    <td>${emp.position || '-'}</td>
                                    <td>${emp.phone || '-'}</td>
                                    <td>${emp.national_id || '-'}</td>
                                    <td>${emp.salary ? formatCurrency(emp.salary) : '-'}</td>
                                    <td>${emp.bank_account || '-'}</td>
                                    <td>${formatDate(emp.hire_date)}</td>
                                    <td><span class="badge ${getEmployeeStatusClass(emp.employment_status)}">${emp.employment_status}</span></td>
                                    <td class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="viewEmployee(${emp.id})" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        ${canModify('employees') ? `
                                            <button class="btn btn-sm btn-secondary" onclick="editEmployee(${emp.id})" title="Edit Employee">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.id}, '${emp.first_name} ${emp.last_name}')" title="Delete Employee">
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
        
        // Restore focus to search input if it had focus before
        if (searchHadFocus) {
            setTimeout(() => {
                const newSearchEl = document.getElementById('employeeSearch');
                if (newSearchEl) {
                    newSearchEl.focus();
                    newSearchEl.setSelectionRange(cursorPosition, cursorPosition);
                }
            }, 0);
        }
    } catch (error) {
        content.innerHTML = showError('Failed to load employees');
    }
}

function getEmployeeStatusClass(status) {
    const classes = {
        'active': 'success',
        'on_leave': 'warning',
        'suspended': 'danger',
        'terminated': 'danger'
    };
    return classes[status] || 'info';
}

function showAddEmployeeModal() {
    showModal('Add New Employee', `
        <form id="addEmployeeForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Employee Code *</label>
                    <input type="text" name="employee_code" required>
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="Hygiene Worker">Hygiene Worker</option>
                        <option value="Security Guard">Security Guard</option>
                        <option value="Technician">Technician</option>
                        <option value="Driver">Driver</option>
                        <option value="Admin Staff">Admin Staff</option>
                    </select>
                </div>
            </div>
            
            <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Personal Information</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" name="first_name" required>
                </div>
                <div class="form-group">
                    <label>Last Name (Father's Name) *</label>
                    <input type="text" name="last_name" required>
                </div>
                <div class="form-group">
                    <label>Grandfather Name *</label>
                    <input type="text" name="grandfather_name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Gender *</label>
                    <select name="gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" name="date_of_birth" required>
                </div>
                <div class="form-group">
                    <label>National ID</label>
                    <input type="text" name="national_id">
                </div>
            </div>
            
            <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Contact Information</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" placeholder="+251..." required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email">
                </div>
            </div>
            <div class="form-group">
                <label>Address *</label>
                <textarea name="address" rows="2" required></textarea>
            </div>
            
            <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Employment Details</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Position *</label>
                    <input type="text" name="position" required>
                </div>
                <div class="form-group">
                    <label>Hire Date *</label>
                    <input type="date" name="hire_date" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Salary (ETB) *</label>
                    <input type="number" name="salary" step="0.01" placeholder="15000.00" required>
                </div>
                <div class="form-group">
                    <label>Bank Account *</label>
                    <input type="text" name="bank_account" placeholder="Account number" required>
                </div>
            </div>
            <div class="form-group">
                <label>Skills</label>
                <textarea name="skills" rows="2" placeholder="Comma-separated skills"></textarea>
            </div>
            
            <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Emergency Contact</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Emergency Contact Name *</label>
                    <input type="text" name="emergency_contact" required>
                </div>
                <div class="form-group">
                    <label>Emergency Phone *</label>
                    <input type="tel" name="emergency_phone" placeholder="+251..." required>
                </div>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
        { text: 'Save Employee', class: 'btn-primary', onclick: submitEmployeeForm }
    ]);
}

async function submitEmployeeForm() {
    const form = document.getElementById('addEmployeeForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest('/employees', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadEmployees();
    } catch (error) {
        alert('Failed to create employee: ' + error.message);
    }
}

async function viewEmployee(id) {
    try {
        const employee = await apiRequest(`/employees/${id}`);
        
        showModal(`Employee Details: ${employee.first_name} ${employee.last_name}`, `
            <div style="display: grid; gap: 16px;">
                <div><strong>Employee Code:</strong> ${employee.employee_code}</div>
                <div><strong>Category:</strong> ${employee.category}</div>
                <div><strong>Position:</strong> ${employee.position || '-'}</div>
                <div><strong>Status:</strong> <span class="badge ${getEmployeeStatusClass(employee.employment_status)}">${employee.employment_status}</span></div>
                <div><strong>Email:</strong> ${employee.email || '-'}</div>
                <div><strong>Phone:</strong> ${employee.phone || '-'}</div>
                <div><strong>Address:</strong> ${employee.address || '-'}</div>
                <div><strong>Date of Birth:</strong> ${formatDate(employee.date_of_birth)}</div>
                <div><strong>Hire Date:</strong> ${formatDate(employee.hire_date)}</div>
                <div><strong>Salary:</strong> ${formatCurrency(employee.salary)}</div>
                <div><strong>Skills:</strong> ${employee.skills || '-'}</div>
                <div><strong>Emergency Contact:</strong> ${employee.emergency_contact || '-'} (${employee.emergency_phone || '-'})</div>
                
                ${employee.guarantors && employee.guarantors.length > 0 ? `
                    <div>
                        <strong>Guarantors:</strong>
                        <div style="margin-top: 8px;">
                            ${employee.guarantors.map(g => `
                                <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div style="flex: 1;">
                                            <strong>${g.guarantor_name}</strong> (${g.guarantor_type || 'N/A'})
                                            <br><small><i class="fas fa-phone"></i> ${g.phone || 'N/A'} | <i class="fas fa-envelope"></i> ${g.email || 'N/A'}</small>
                                            <br><small><i class="fas fa-user-friends"></i> ${g.relationship || 'N/A'}</small>
                                            ${g.address ? `<br><small><i class="fas fa-map-marker-alt"></i> ${g.address}</small>` : ''}
                                            ${g.id_number ? `<br><small><i class="fas fa-id-card"></i> ID: ${g.id_number}</small>` : ''}
                                            <br><span class="badge ${g.verification_status === 'verified' ? 'success' : g.verification_status === 'rejected' ? 'danger' : 'warning'}">${g.verification_status}</span>
                                        </div>
                                        ${canModify('employees') ? `
                                            <div style="display: flex; gap: 4px; flex-direction: column;">
                                                <button class="btn btn-sm btn-primary" onclick="showUploadGuarantorDocModal(${g.id}, ${id})" title="Upload Document">
                                                    <i class="fas fa-upload"></i> Upload
                                                </button>
                                                <button class="btn btn-sm btn-secondary" onclick="changeGuarantorStatus(${g.id}, ${id})" title="Change Status">
                                                    <i class="fas fa-check-circle"></i> Verify
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteGuarantor(${g.id}, ${id}, '${g.guarantor_name}')" title="Delete Guarantor">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                    ${g.documents && g.documents.length > 0 ? `
                                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">
                                            <strong style="font-size: 13px;">Documents:</strong>
                                            <div style="margin-top: 6px;">
                                                ${g.documents.map(doc => {
                                                    const escapedPath = doc.file_path.replace(/\\/g, '\\\\');
                                                    return `
                                                    <div style="padding: 6px 8px; background: var(--bg-primary); border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                                                        <div>
                                                            <i class="fas fa-file"></i> 
                                                            <strong>${doc.document_type}</strong> - ${doc.file_name}
                                                        </div>
                                                        <div style="display: flex; gap: 4px;">
                                                            <button class="btn btn-xs btn-primary" onclick="previewDocument('${escapedPath}')" title="Preview">
                                                                <i class="fas fa-eye"></i>
                                                            </button>
                                                            <button class="btn btn-xs btn-success" onclick="downloadDocument('${escapedPath}', '${doc.file_name}')" title="Download">
                                                                <i class="fas fa-download"></i>
                                                            </button>
                                                            ${canModify('employees') ? `
                                                                <button class="btn btn-xs btn-danger" onclick="deleteGuarantorDocument(${doc.id}, ${id})" title="Delete">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    </div>
                                                `}).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '<div><em style="color: var(--text-secondary);">No guarantors added yet</em></div>'}
                
                ${employee.assignments && employee.assignments.length > 0 ? `
                    <div>
                        <strong>Current Assignments:</strong>
                        <ul style="margin-top: 8px;">
                            ${employee.assignments.filter(a => a.status === 'active').map(a => `
                                <li>${a.client_name} - ${a.location}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${employee.documents && employee.documents.length > 0 ? `
                    <div>
                        <strong>Documents:</strong>
                        <div style="margin-top: 8px;">
                            ${employee.documents.map(doc => {
                                const escapedPath = doc.file_path.replace(/\\/g, '\\\\');
                                return `
                                <div style="padding: 8px; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <i class="fas fa-file"></i> 
                                        <strong>${doc.document_type}</strong> - ${doc.file_name}
                                        ${doc.expiry_date ? `<br><small style="color: var(--text-secondary);">Expires: ${formatDate(doc.expiry_date)}</small>` : ''}
                                    </div>
                                    <div style="display: flex; gap: 4px;">
                                        <button class="btn btn-sm btn-primary" onclick="previewDocument('${escapedPath}')" title="Preview">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="downloadDocument('${escapedPath}', '${doc.file_name}')" title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        ${canModify('employees') ? `
                                            <button class="btn btn-sm btn-danger" onclick="deleteDocument(${doc.id}, ${id})" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${canModify('employees') ? `
                    <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="showUploadEmployeeDocumentModal(${id})">
                            <i class="fas fa-upload"></i> Upload Document
                        </button>
                        <button class="btn btn-secondary" onclick="showAddGuarantorModal(${id})">
                            <i class="fas fa-user-shield"></i> Add Guarantor
                        </button>
                        <button class="btn btn-secondary" onclick="showRecordAttendanceModal(${id})">
                            <i class="fas fa-clock"></i> Record Attendance
                        </button>
                    </div>
                ` : ''}
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', onclick: closeModal }
        ]);
    } catch (error) {
        alert('Failed to load employee details');
    }
}

function showAddGuarantorModal(employeeId) {
    showModal('Add Guarantor', `
        <form id="addGuarantorForm">
            <div class="form-group">
                <label>Guarantor Name *</label>
                <input type="text" name="guarantor_name" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="guarantor_type">
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="employer">Employer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Relationship</label>
                    <input type="text" name="relationship">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2"></textarea>
            </div>
            <div class="form-group">
                <label>ID Number</label>
                <input type="text" name="id_number">
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
        { text: 'Save Guarantor', class: 'btn-primary', onclick: () => submitGuarantorForm(employeeId) }
    ]);
}

async function submitGuarantorForm(employeeId) {
    const form = document.getElementById('addGuarantorForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/employees/${employeeId}/guarantors`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        viewEmployee(employeeId);
        alert('Guarantor added successfully!');
    } catch (error) {
        alert('Failed to add guarantor: ' + error.message);
    }
}

function showUploadGuarantorDocModal(guarantorId, employeeId) {
    showModal('Upload Guarantor Document', `
        <form id="uploadGuarantorDocForm" enctype="multipart/form-data" onsubmit="return false;">
            <div class="form-group">
                <label>Document Type *</label>
                <select name="document_type" required>
                    <option value="">Select Type</option>
                    <option value="ID Card">ID Card / National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Proof of Address">Proof of Address</option>
                    <option value="Employment Letter">Employment Letter</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Property Document">Property Document</option>
                    <option value="Guarantee Letter">Guarantee Letter</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Select File *</label>
                <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                <small style="color: var(--text-secondary);">Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</small>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
        { text: 'Upload', class: 'btn-primary', id: 'uploadGuarantorDocBtn', onclick: () => submitGuarantorDocumentUpload(guarantorId, employeeId) }
    ]);
}

// Flag to prevent double submission
let isUploadingGuarantorDoc = false;

async function submitGuarantorDocumentUpload(guarantorId, employeeId) {
    // Prevent double submission
    if (isUploadingGuarantorDoc) {
        console.log('Upload already in progress, ignoring duplicate request');
        return;
    }
    
    const form = document.getElementById('uploadGuarantorDocForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.querySelector('[name="document_type"]').value) {
        alert('Please select a document type');
        return;
    }
    
    if (!form.querySelector('[name="file"]').files[0]) {
        alert('Please select a file');
        return;
    }
    
    // Find and disable all buttons in the modal
    const modalButtons = document.querySelectorAll('.modal-footer button');
    modalButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.includes('Upload')) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }
    });
    
    const uploadId = Date.now();
    console.log('=== UPLOAD START ===');
    console.log('Upload ID:', uploadId);
    console.log('Guarantor ID:', guarantorId);
    console.log('Document type:', formData.get('document_type'));
    console.log('File:', formData.get('file').name);
    console.log('Flag status before:', isUploadingGuarantorDoc);
    
    isUploadingGuarantorDoc = true;
    console.log('Flag status after:', isUploadingGuarantorDoc);
    
    try {
        console.log('Sending fetch request...', uploadId);
        const response = await fetch(`${API_URL}/employees/guarantors/${guarantorId}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        console.log('Upload successful:', uploadId, data);
        console.log('=== UPLOAD END ===');
        document.querySelector('.modal').remove();
        alert('Guarantor document uploaded successfully!');
        viewEmployee(employeeId);
    } catch (error) {
        console.error('Upload error:', uploadId, error);
        alert('Failed to upload document: ' + error.message);
        // Re-enable buttons on error
        modalButtons.forEach(btn => {
            btn.disabled = false;
            if (btn.textContent.includes('Uploading')) {
                btn.textContent = 'Upload';
            }
        });
    } finally {
        isUploadingGuarantorDoc = false;
    }
}

async function deleteGuarantor(guarantorId, employeeId, guarantorName) {
    if (!confirm(`Are you sure you want to delete guarantor "${guarantorName}"?\n\nThis will also delete all associated documents.\n\nThis action cannot be undone!`)) {
        return;
    }
    
    try {
        await apiRequest(`/employees/guarantors/${guarantorId}`, {
            method: 'DELETE'
        });
        
        viewEmployee(employeeId);
        alert('Guarantor deleted successfully!');
    } catch (error) {
        alert('Failed to delete guarantor: ' + error.message);
    }
}

function changeGuarantorStatus(guarantorId, employeeId) {
    showModal('Change Verification Status', `
        <form id="changeStatusForm">
            <div class="form-group">
                <label>Verification Status *</label>
                <select name="verification_status" required>
                    <option value="pending">⏳ Pending - Awaiting verification</option>
                    <option value="verified">✅ Verified - Documents approved</option>
                    <option value="rejected">❌ Rejected - Verification failed</option>
                </select>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 12px;">
                <strong>Note:</strong> Make sure all required documents are uploaded and verified before approving.
            </p>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
        { text: 'Update Status', class: 'btn-primary', onclick: () => submitStatusChange(guarantorId, employeeId) }
    ]);
}

async function submitStatusChange(guarantorId, employeeId) {
    const form = document.getElementById('changeStatusForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/employees/guarantors/${guarantorId}/verify`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        viewEmployee(employeeId);
        alert('Verification status updated successfully!');
    } catch (error) {
        alert('Failed to update status: ' + error.message);
    }
}

function filterEmployees(isSearch = false) {
    if (isSearch) {
        // Debounce search input - wait 500ms after user stops typing
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            loadEmployees();
        }, 500);
    } else {
        // Immediate filter for dropdowns
        loadEmployees();
    }
}

function showUploadEmployeeDocumentModal(employeeId) {
    showModal('Upload Employee Document', `
        <form id="uploadEmployeeDocForm" enctype="multipart/form-data">
            <div class="form-group">
                <label>Document Type *</label>
                <select name="document_type" required>
                    <option value="">Select Type</option>
                    <option value="ID Card">ID Card / National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="CV">CV / Resume</option>
                    <option value="Educational Certificate">Educational Certificate</option>
                    <option value="Professional Certificate">Professional Certificate</option>
                    <option value="Training Certificate">Training Certificate</option>
                    <option value="Medical Certificate">Medical Certificate</option>
                    <option value="Police Clearance">Police Clearance</option>
                    <option value="Employment Contract">Employment Contract</option>
                    <option value="Experience Letter">Experience Letter</option>
                    <option value="Reference Letter">Reference Letter</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Expiry Date (if applicable)</label>
                <input type="date" name="expiry_date">
                <small style="color: var(--text-secondary);">Leave empty if document doesn't expire</small>
            </div>
            <div class="form-group">
                <label>Select File *</label>
                <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                <small style="color: var(--text-secondary);">Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</small>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
        { text: 'Upload', class: 'btn-primary', onclick: () => submitEmployeeDocumentUpload(employeeId) }
    ]);
}

async function submitEmployeeDocumentUpload(employeeId) {
    const form = document.getElementById('uploadEmployeeDocForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`${API_URL}/employees/${employeeId}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        document.querySelector('.modal').remove();
        viewEmployee(employeeId);
        alert('Document uploaded successfully!');
    } catch (error) {
        alert('Failed to upload document: ' + error.message);
    }
}

async function deleteDocument(docId, employeeId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }
    
    try {
        await apiRequest(`/employees/documents/${docId}`, {
            method: 'DELETE'
        });
        
        viewEmployee(employeeId);
        alert('Document deleted successfully!');
    } catch (error) {
        alert('Failed to delete document: ' + error.message);
    }
}

function showRecordAttendanceModal(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    showModal('Record Attendance', `
        <form id="recordAttendanceForm">
            <div class="form-group">
                <label>Date *</label>
                <input type="date" name="date" value="${today}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Check In Time</label>
                    <input type="time" name="check_in" value="${now}">
                </div>
                <div class="form-group">
                    <label>Check Out Time</label>
                    <input type="time" name="check_out">
                </div>
            </div>
            <div class="form-group">
                <label>Status *</label>
                <select name="status" required>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="on_leave">On Leave</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2"></textarea>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
        { text: 'Record', class: 'btn-primary', onclick: () => submitAttendanceRecord(employeeId) }
    ]);
}

async function submitAttendanceRecord(employeeId) {
    const form = document.getElementById('recordAttendanceForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/employees/${employeeId}/attendance`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        alert('Attendance recorded successfully!');
    } catch (error) {
        alert('Failed to record attendance: ' + error.message);
    }
}

async function editEmployee(id) {
    try {
        const employee = await apiRequest(`/employees/${id}`);
        
        showModal(`Edit Employee: ${employee.first_name} ${employee.last_name}`, `
            <form id="editEmployeeForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Employee Code</label>
                        <input type="text" value="${employee.employee_code}" disabled>
                        <small style="color: var(--text-secondary);">Cannot be changed</small>
                    </div>
                    <div class="form-group">
                        <label>Category *</label>
                        <select name="category" required>
                            <option value="Hygiene Worker" ${employee.category === 'Hygiene Worker' ? 'selected' : ''}>Hygiene Worker</option>
                            <option value="Security Guard" ${employee.category === 'Security Guard' ? 'selected' : ''}>Security Guard</option>
                            <option value="Technician" ${employee.category === 'Technician' ? 'selected' : ''}>Technician</option>
                            <option value="Driver" ${employee.category === 'Driver' ? 'selected' : ''}>Driver</option>
                            <option value="Admin Staff" ${employee.category === 'Admin Staff' ? 'selected' : ''}>Admin Staff</option>
                        </select>
                    </div>
                </div>
                
                <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Personal Information</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" name="first_name" value="${employee.first_name}" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name (Father's Name) *</label>
                        <input type="text" name="last_name" value="${employee.last_name}" required>
                    </div>
                    <div class="form-group">
                        <label>Grandfather Name *</label>
                        <input type="text" name="grandfather_name" value="${employee.grandfather_name || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Gender *</label>
                        <select name="gender" required>
                            <option value="">Select Gender</option>
                            <option value="Male" ${employee.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${employee.gender === 'Female' ? 'selected' : ''}>Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth *</label>
                        <input type="date" name="date_of_birth" value="${employee.date_of_birth || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>National ID</label>
                        <input type="text" name="national_id" value="${employee.national_id || ''}">
                    </div>
                </div>
                
                <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Contact Information</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone *</label>
                        <input type="tel" name="phone" value="${employee.phone || ''}" placeholder="+251..." required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${employee.email || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Address *</label>
                    <textarea name="address" rows="2" required>${employee.address || ''}</textarea>
                </div>
                
                <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Employment Details</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Position *</label>
                        <input type="text" name="position" value="${employee.position || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Employment Status</label>
                        <select name="employment_status">
                            <option value="active" ${employee.employment_status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="on_leave" ${employee.employment_status === 'on_leave' ? 'selected' : ''}>On Leave</option>
                            <option value="suspended" ${employee.employment_status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            <option value="terminated" ${employee.employment_status === 'terminated' ? 'selected' : ''}>Terminated</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Salary (ETB) *</label>
                        <input type="number" name="salary" step="0.01" value="${employee.salary || ''}" placeholder="15000.00" required>
                    </div>
                    <div class="form-group">
                        <label>Bank Account *</label>
                        <input type="text" name="bank_account" value="${employee.bank_account || ''}" placeholder="Account number" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Skills</label>
                    <textarea name="skills" rows="2" placeholder="Comma-separated skills">${employee.skills || ''}</textarea>
                </div>
                
                <h4 style="margin: 16px 0 8px 0; color: var(--primary-color);">Emergency Contact</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Emergency Contact Name *</label>
                        <input type="text" name="emergency_contact" value="${employee.emergency_contact || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Emergency Phone *</label>
                        <input type="tel" name="emergency_phone" value="${employee.emergency_phone || ''}" placeholder="+251..." required>
                    </div>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', onclick: closeModal },
            { text: 'Update Employee', class: 'btn-primary', onclick: () => submitEditEmployeeForm(id) }
        ]);
    } catch (error) {
        alert('Failed to load employee details: ' + error.message);
    }
}

async function submitEditEmployeeForm(id) {
    const form = document.getElementById('editEmployeeForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await apiRequest(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        document.querySelector('.modal').remove();
        loadEmployees();
        alert('Employee updated successfully!');
    } catch (error) {
        alert('Failed to update employee: ' + error.message);
    }
}

async function deleteEmployee(id, name) {
    if (!confirm(`Are you sure you want to delete employee "${name}"?\n\nThis will also delete:\n- All employee documents\n- All guarantor records\n- All attendance records\n\nThis action cannot be undone!`)) {
        return;
    }
    
    try {
        await apiRequest(`/employees/${id}`, {
            method: 'DELETE'
        });
        
        loadEmployees();
        alert('Employee deleted successfully!');
    } catch (error) {
        alert('Failed to delete employee: ' + error.message);
    }
}


// Export employees to CSV
function exportEmployees() {
    // Show export options modal
    showModal('Export Employees', `
        <form id="exportOptionsForm">
            <h4 style="margin: 0 0 12px 0; color: var(--primary-color);">Filter Options</h4>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <select name="category">
                        <option value="">All Categories</option>
                        <option value="Hygiene Worker" ${employeeFilters.category === 'Hygiene Worker' ? 'selected' : ''}>Hygiene Worker</option>
                        <option value="Security Guard" ${employeeFilters.category === 'Security Guard' ? 'selected' : ''}>Security Guard</option>
                        <option value="Technician" ${employeeFilters.category === 'Technician' ? 'selected' : ''}>Technician</option>
                        <option value="Driver" ${employeeFilters.category === 'Driver' ? 'selected' : ''}>Driver</option>
                        <option value="Admin Staff" ${employeeFilters.category === 'Admin Staff' ? 'selected' : ''}>Admin Staff</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="">All Status</option>
                        <option value="active" ${employeeFilters.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="on_leave" ${employeeFilters.status === 'on_leave' ? 'selected' : ''}>On Leave</option>
                        <option value="suspended" ${employeeFilters.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                        <option value="terminated" ${employeeFilters.status === 'terminated' ? 'selected' : ''}>Terminated</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Gender</label>
                    <select name="gender">
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Position</label>
                    <input type="text" name="position" placeholder="e.g., Senior Guard">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Document Status</label>
                    <select name="docStatus">
                        <option value="">All Documents</option>
                        <option value="complete" ${employeeFilters.docStatus === 'complete' ? 'selected' : ''}>Complete</option>
                        <option value="incomplete" ${employeeFilters.docStatus === 'incomplete' ? 'selected' : ''}>Incomplete</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Guarantee Status</label>
                    <select name="guarantee">
                        <option value="">All Guarantees</option>
                        <option value="verified" ${employeeFilters.guarantee === 'verified' ? 'selected' : ''}>Verified</option>
                        <option value="expired" ${employeeFilters.guarantee === 'expired' ? 'selected' : ''}>Rejected</option>
                        <option value="missing" ${employeeFilters.guarantee === 'missing' ? 'selected' : ''}>Missing</option>
                    </select>
                </div>
            </div>
            
            <h4 style="margin: 16px 0 12px 0; color: var(--primary-color);">Salary Range (ETB)</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Minimum Salary</label>
                    <input type="number" name="minSalary" placeholder="0" step="100">
                </div>
                <div class="form-group">
                    <label>Maximum Salary</label>
                    <input type="number" name="maxSalary" placeholder="No limit" step="100">
                </div>
            </div>
            
            <div class="form-group">
                <label>Search</label>
                <input type="text" name="search" placeholder="Search by name or code..." value="${employeeFilters.search || ''}">
            </div>
            
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 16px;">
                <strong>Note:</strong> Leave filters empty to export all employees. Current page filters are pre-selected.
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
        { text: 'Export CSV', class: 'btn-primary', onclick: 'submitExportEmployees()' }
    ]);
}

async function submitExportEmployees() {
    try {
        console.log('Starting export...');
        
        const form = document.getElementById('exportOptionsForm');
        const formData = new FormData(form);
        
        // Build query string from form
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }
        
        const queryString = params.toString();
        const url = `/api/employees/export${queryString ? '?' + queryString : ''}`;
        
        console.log('Export URL:', url);
        
        // Add authorization header by fetching as blob
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Export error:', errorText);
            throw new Error(`Export failed: ${response.status} - ${errorText}`);
        }
        
        const blob = await response.blob();
        console.log('Blob size:', blob.size);
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        console.log('Export completed successfully');
        
        // Close modal
        document.querySelector('.modal').remove();
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export employees: ' + error.message);
    }
}

// Show import CSV modal
function showImportEmployeesModal() {
    showModal('Import Employees from CSV', `
        <div style="margin-bottom: 16px;">
            <p style="margin-bottom: 12px;">Upload a CSV file with employee data. The file should have the following columns:</p>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px;">
                <strong>Required columns:</strong><br>
                employee_code, first_name, last_name, category, position, phone, email, hire_date
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px;">
                <strong>Optional columns:</strong><br>
                date_of_birth, national_id, address, emergency_contact, emergency_phone, salary, bank_account, status
            </div>
            <div style="background: var(--warning-bg); padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px; color: var(--warning-color);">
                <strong>Note:</strong> Salary should be in ETB (Ethiopian Birr). Full name will be automatically generated from first_name and last_name.
            </div>
            <button class="btn btn-secondary" onclick="downloadEmployeeTemplate()">
                <i class="fas fa-download"></i> Download Template
            </button>
        </div>
        <form id="importEmployeesForm">
            <div class="form-group">
                <label>Select CSV File *</label>
                <input type="file" id="csvFile" accept=".csv" required>
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" name="skipDuplicates" checked>
                    Skip duplicate employee codes
                </label>
            </div>
        </form>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() },
        { text: 'Import', class: 'btn-primary', onclick: 'submitImportEmployees()' }
    ]);
}

// Download CSV template
function downloadEmployeeTemplate() {
    const template = `employee_code,first_name,last_name,category,position,phone,email,hire_date,date_of_birth,national_id,address,emergency_contact,emergency_phone,salary,bank_account,status
EMP001,John,Doe,Security Guard,Senior Guard,+251911234567,john@example.com,2024-01-01,1990-01-01,ID123456,123 Main St Addis Ababa,Jane Doe,+251911234568,15000,1234567890,active
EMP002,Jane,Smith,Hygiene Worker,Cleaner,+251922345678,jane@example.com,2024-01-15,1992-05-15,ID789012,456 Oak Ave Addis Ababa,John Smith,+251922345679,12000,0987654321,active`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Submit import employees
async function submitImportEmployees() {
    const fileInput = document.getElementById('csvFile');
    const skipDuplicates = document.querySelector('input[name="skipDuplicates"]').checked;
    
    if (!fileInput.files[0]) {
        alert('Please select a CSV file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('skipDuplicates', skipDuplicates);
    
    try {
        const response = await fetch('/api/employees/import', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Import failed');
        }
        
        document.querySelector('.modal').remove();
        alert(`Import successful!\n\nImported: ${result.imported}\nSkipped: ${result.skipped}\nErrors: ${result.errors}`);
        loadEmployees();
    } catch (error) {
        alert('Failed to import employees: ' + error.message);
    }
}


// Preview document
function previewDocument(filePath) {
    // Normalize path for Windows (replace backslashes with forward slashes)
    const normalizedPath = filePath.replace(/\\/g, '/');
    const fileUrl = `/${normalizedPath}`;
    const fileExt = normalizedPath.split('.').pop().toLowerCase();
    
    // Check if it's an image
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt)) {
        showModal('Document Preview', `
            <div style="text-align: center;">
                <img src="${fileUrl}" style="max-width: 100%; max-height: 70vh; border-radius: 6px;" alt="Document Preview">
            </div>
        `, [
            { text: 'Download', class: 'btn-success', onclick: () => downloadDocument(filePath, normalizedPath.split('/').pop()) },
            { text: 'Close', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() }
        ]);
    } 
    // Check if it's a PDF
    else if (fileExt === 'pdf') {
        showModal('Document Preview', `
            <div style="width: 100%; height: 70vh;">
                <iframe src="${fileUrl}" style="width: 100%; height: 100%; border: none; border-radius: 6px;"></iframe>
            </div>
        `, [
            { text: 'Download', class: 'btn-success', onclick: () => downloadDocument(filePath, normalizedPath.split('/').pop()) },
            { text: 'Close', class: 'btn-secondary', onclick: () => document.querySelector('.modal').remove() }
        ]);
    }
    // For other file types, just download
    else {
        alert('Preview not available for this file type. Downloading instead...');
        downloadDocument(filePath, normalizedPath.split('/').pop());
    }
}

// Download document
function downloadDocument(filePath, fileName) {
    // Normalize path for Windows (replace backslashes with forward slashes)
    const normalizedPath = filePath.replace(/\\/g, '/');
    const link = document.createElement('a');
    link.href = `/${normalizedPath}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete guarantor document
async function deleteGuarantorDocument(docId, employeeId) {
    if (!confirm('Are you sure you want to delete this guarantor document?')) {
        return;
    }
    
    try {
        await apiRequest(`/employees/guarantors/documents/${docId}`, {
            method: 'DELETE'
        });
        
        alert('Guarantor document deleted successfully!');
        // Refresh the employee view
        viewEmployee(employeeId);
    } catch (error) {
        alert('Failed to delete guarantor document: ' + error.message);
    }
}

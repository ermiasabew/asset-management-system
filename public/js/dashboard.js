async function loadDashboard() {
    const content = document.getElementById('contentArea');
    content.innerHTML = showLoading();
    
    try {
        const stats = await apiRequest('/reports/dashboard');
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.assets.total}</h3>
                        <p>Total Assets</p>
                        <small style="color: var(--text-secondary);">
                            ${stats.assets.available} Available | ${stats.assets.assigned} Assigned
                        </small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-warehouse"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.inventory.total}</h3>
                        <p>Inventory Items</p>
                        <small style="color: ${stats.inventory.lowStock > 0 ? 'var(--warning-color)' : 'var(--text-secondary)'};">
                            ${stats.inventory.lowStock} Low Stock Items
                        </small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.employees.total}</h3>
                        <p>Total Employees</p>
                        <small style="color: var(--text-secondary);">
                            ${stats.employees.active} Active | ${stats.employees.deployed} Deployed
                        </small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon yellow">
                        <i class="fas fa-handshake"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.clients.total}</h3>
                        <p>Total Clients</p>
                        <small style="color: var(--text-secondary);">
                            ${stats.clients.active} Active Contracts
                        </small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon red">
                        <i class="fas fa-home"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.rentals.total}</h3>
                        <p>Rental Properties</p>
                        <small style="color: var(--text-secondary);">
                            ${stats.rentals.occupied} Occupied | ${stats.rentals.available} Available
                        </small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${formatCurrency(stats.rentals.monthlyRevenue)}</h3>
                        <p>Monthly Rental Revenue</p>
                        <small style="color: var(--text-secondary);">From occupied properties</small>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Quick Actions</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    ${canModify('assets') ? `
                        <button class="btn btn-primary" onclick="navigateTo('assets')">
                            <i class="fas fa-plus"></i> Add Asset
                        </button>
                    ` : ''}
                    ${canModify('inventory') ? `
                        <button class="btn btn-primary" onclick="navigateTo('inventory')">
                            <i class="fas fa-plus"></i> Add Inventory Item
                        </button>
                    ` : ''}
                    ${canModify('employees') ? `
                        <button class="btn btn-primary" onclick="navigateTo('employees')">
                            <i class="fas fa-plus"></i> Add Employee
                        </button>
                    ` : ''}
                    ${canModify('clients') ? `
                        <button class="btn btn-primary" onclick="navigateTo('clients')">
                            <i class="fas fa-plus"></i> Add Client
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">System Overview</h3>
                </div>
                <p style="color: var(--text-secondary);">
                    Welcome to the Asset and Inventory Management System. Use the navigation menu to access different modules.
                    The dashboard provides a quick overview of your organization's assets, inventory, employees, and clients.
                </p>
            </div>
        `;
    } catch (error) {
        content.innerHTML = showError('Failed to load dashboard data');
    }
}

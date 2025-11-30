async function loadReports() {
    const content = document.getElementById('contentArea');
    content.innerHTML = showLoading();
    
    try {
        const [assetUtil, empDist, invStock, revenue] = await Promise.all([
            apiRequest('/reports/asset-utilization'),
            apiRequest('/reports/employee-distribution'),
            apiRequest('/reports/inventory-stock'),
            apiRequest('/reports/monthly-revenue')
        ]);
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Reports & Analytics</h3>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div class="card">
                        <h4>Monthly Revenue</h4>
                        <div style="margin-top: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Rental Income:</span>
                                <strong>${formatCurrency(revenue.rental)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Service Income:</span>
                                <strong>${formatCurrency(revenue.services)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid var(--border-color);">
                                <span><strong>Total:</strong></span>
                                <strong style="color: var(--success-color);">${formatCurrency(revenue.total)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>Asset Utilization by Category</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Total</th>
                                    <th>Available</th>
                                    <th>Assigned</th>
                                    <th>Rented</th>
                                    <th>Maintenance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${assetUtil.map(item => `
                                    <tr>
                                        <td>${item.category}</td>
                                        <td>${item.total}</td>
                                        <td>${item.available}</td>
                                        <td>${item.assigned}</td>
                                        <td>${item.rented}</td>
                                        <td>${item.maintenance}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>Employee Distribution</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Total</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${empDist.map(item => `
                                    <tr>
                                        <td>${item.category}</td>
                                        <td>${item.total}</td>
                                        <td>${item.active}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>Inventory Stock Status</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Items</th>
                                    <th>Total Stock</th>
                                    <th>Low Stock Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invStock.map(item => `
                                    <tr>
                                        <td>${item.category}</td>
                                        <td>${item.items}</td>
                                        <td>${item.total_stock}</td>
                                        <td>${item.low_stock_items > 0 ? `<span style="color: var(--warning-color);">${item.low_stock_items}</span>` : '0'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = showError('Failed to load reports');
    }
}

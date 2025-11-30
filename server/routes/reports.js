const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const stats = {
      assets: {
        total: 0,
        available: 0,
        rented: 0,
        maintenance: 0,
        assigned: 0
      },
      inventory: {
        total: 0,
        lowStock: 0,
        outOfStock: 0
      },
      employees: {
        total: 0,
        active: 0,
        deployed: 0,
        onLeave: 0
      },
      clients: {
        total: 0,
        active: 0
      },
      rentals: {
        total: 0,
        occupied: 0,
        available: 0,
        monthlyRevenue: 0
      }
    };

    // Assets
    const assetStats = await db.all('SELECT status, COUNT(*) as count FROM assets GROUP BY status');
    stats.assets.total = assetStats.reduce((sum, s) => sum + s.count, 0);
    assetStats.forEach(s => {
      if (s.status === 'available') stats.assets.available = s.count;
      if (s.status === 'rented') stats.assets.rented = s.count;
      if (s.status === 'maintenance') stats.assets.maintenance = s.count;
      if (s.status === 'assigned') stats.assets.assigned = s.count;
    });

    // Inventory
    const inventoryStats = await db.get('SELECT COUNT(*) as total, SUM(CASE WHEN current_stock <= min_stock THEN 1 ELSE 0 END) as lowStock, SUM(CASE WHEN current_stock = 0 THEN 1 ELSE 0 END) as outOfStock FROM inventory');
    stats.inventory = inventoryStats;

    // Employees
    const employeeStats = await db.all('SELECT employment_status, COUNT(*) as count FROM employees GROUP BY employment_status');
    stats.employees.total = employeeStats.reduce((sum, s) => sum + s.count, 0);
    employeeStats.forEach(s => {
      if (s.employment_status === 'active') stats.employees.active = s.count;
      if (s.employment_status === 'on_leave') stats.employees.onLeave = s.count;
    });
    const deployed = await db.get('SELECT COUNT(DISTINCT employee_id) as count FROM employee_assignments WHERE status = ?', ['active']);
    stats.employees.deployed = deployed.count;

    // Clients
    const clientStats = await db.all('SELECT status, COUNT(*) as count FROM clients GROUP BY status');
    stats.clients.total = clientStats.reduce((sum, s) => sum + s.count, 0);
    clientStats.forEach(s => {
      if (s.status === 'active') stats.clients.active = s.count;
    });

    // Rentals
    const rentalStats = await db.all('SELECT status, COUNT(*) as count FROM rental_properties GROUP BY status');
    stats.rentals.total = rentalStats.reduce((sum, s) => sum + s.count, 0);
    rentalStats.forEach(s => {
      if (s.status === 'rented') stats.rentals.occupied = s.count;
      if (s.status === 'available') stats.rentals.available = s.count;
    });
    const revenue = await db.get('SELECT SUM(monthly_rent) as total FROM rental_properties WHERE status = ?', ['rented']);
    stats.rentals.monthlyRevenue = revenue.total || 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Asset utilization report
router.get('/asset-utilization', auth, async (req, res) => {
  try {
    const report = await db.all(`
      SELECT category, 
             COUNT(*) as total,
             SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
             SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
             SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
             SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM assets
      GROUP BY category
    `);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employee distribution report
router.get('/employee-distribution', auth, async (req, res) => {
  try {
    const report = await db.all(`
      SELECT category, 
             COUNT(*) as total,
             SUM(CASE WHEN employment_status = 'active' THEN 1 ELSE 0 END) as active
      FROM employees
      GROUP BY category
    `);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory stock report
router.get('/inventory-stock', auth, async (req, res) => {
  try {
    const report = await db.all(`
      SELECT category,
             COUNT(*) as items,
             SUM(current_stock) as total_stock,
             SUM(CASE WHEN current_stock <= min_stock THEN 1 ELSE 0 END) as low_stock_items
      FROM inventory
      GROUP BY category
    `);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monthly revenue report
router.get('/monthly-revenue', auth, async (req, res) => {
  try {
    const rentalRevenue = await db.get('SELECT SUM(monthly_rent) as total FROM rental_properties WHERE status = ?', ['rented']);
    const serviceRevenue = await db.get('SELECT SUM(monthly_fee) as total FROM service_contracts WHERE status = ?', ['active']);
    
    res.json({
      rental: rentalRevenue.total || 0,
      services: serviceRevenue.total || 0,
      total: (rentalRevenue.total || 0) + (serviceRevenue.total || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent activities
router.get('/recent-activities', auth, async (req, res) => {
  try {
    const activities = await db.all(`
      SELECT al.*, u.username 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 50
    `);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = [];

    // Low stock alerts
    const lowStock = await db.all('SELECT * FROM inventory WHERE current_stock <= min_stock AND status = ?', ['active']);
    lowStock.forEach(item => {
      notifications.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${item.name} is running low (${item.current_stock} ${item.unit})`,
        created_at: new Date().toISOString()
      });
    });

    // Expiring documents
    const expiringDocs = await db.all(`
      SELECT ed.*, e.first_name, e.last_name 
      FROM employee_documents ed
      JOIN employees e ON ed.employee_id = e.id
      WHERE ed.expiry_date <= date('now', '+30 days') AND ed.expiry_date >= date('now')
    `);
    expiringDocs.forEach(doc => {
      notifications.push({
        type: 'info',
        title: 'Document Expiring Soon',
        message: `${doc.document_type} for ${doc.first_name} ${doc.last_name} expires on ${doc.expiry_date}`,
        created_at: new Date().toISOString()
      });
    });

    // Expiring contracts
    const expiringContracts = await db.all(`
      SELECT t.*, rp.name as property_name
      FROM tenants t
      JOIN rental_properties rp ON t.property_id = rp.id
      WHERE t.contract_end <= date('now', '+30 days') AND t.contract_end >= date('now') AND t.status = 'active'
    `);
    expiringContracts.forEach(tenant => {
      notifications.push({
        type: 'warning',
        title: 'Rental Contract Expiring',
        message: `Contract for ${tenant.tenant_name} at ${tenant.property_name} expires on ${tenant.contract_end}`,
        created_at: new Date().toISOString()
      });
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get company settings
router.get('/company', auth, authorize('admin'), async (req, res) => {
  try {
    let settings = await db.get('SELECT * FROM settings WHERE id = 1');
    
    if (!settings) {
      // Create default settings
      await db.run(`
        INSERT INTO settings (id, company_name, currency, date_format, timezone, items_per_page)
        VALUES (1, 'Asset Management System', 'ETB', 'YYYY-MM-DD', 'Africa/Addis_Ababa', 10)
      `);
      settings = await db.get('SELECT * FROM settings WHERE id = 1');
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update company settings
router.put('/company', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      company_name,
      business_type,
      company_email,
      company_phone,
      company_address,
      tax_id,
      registration_number
    } = req.body;
    
    await db.run(`
      UPDATE settings SET
        company_name = ?,
        business_type = ?,
        company_email = ?,
        company_phone = ?,
        company_address = ?,
        tax_id = ?,
        registration_number = ?
      WHERE id = 1
    `, [company_name, business_type, company_email, company_phone, company_address, tax_id, registration_number]);
    
    res.json({ message: 'Company settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system settings
router.get('/system', auth, authorize('admin'), async (req, res) => {
  try {
    let settings = await db.get('SELECT * FROM settings WHERE id = 1');
    
    if (!settings) {
      await db.run(`
        INSERT INTO settings (id, currency, date_format, timezone, items_per_page)
        VALUES (1, 'ETB', 'YYYY-MM-DD', 'Africa/Addis_Ababa', 10)
      `);
      settings = await db.get('SELECT * FROM settings WHERE id = 1');
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update system settings
router.put('/system', auth, authorize('admin'), async (req, res) => {
  try {
    const { currency, date_format, timezone, items_per_page } = req.body;
    
    await db.run(`
      UPDATE settings SET
        currency = ?,
        date_format = ?,
        timezone = ?,
        items_per_page = ?
      WHERE id = 1
    `, [currency, date_format, timezone, items_per_page]);
    
    res.json({ message: 'System settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup database and files
router.get('/backup', auth, authorize('admin'), async (req, res) => {
  try {
    const archiver = require('archiver');
    const dbPath = path.join(__dirname, '../../database/company.db');
    const uploadsPath = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    
    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `backup-${timestamp}.zip`;
    
    res.attachment(filename);
    archive.pipe(res);
    
    // Add database file
    archive.file(dbPath, { name: 'database/company.db' });
    
    // Add uploads folder if it exists
    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }
    
    // Add backup info file
    const backupInfo = {
      timestamp: new Date().toISOString(),
      created_by: req.user.username,
      version: '1.0',
      includes: {
        database: true,
        uploads: fs.existsSync(uploadsPath)
      }
    };
    archive.append(JSON.stringify(backupInfo, null, 2), { name: 'backup-info.json' });
    
    await archive.finalize();
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cache (placeholder)
router.post('/clear-cache', auth, authorize('admin'), async (req, res) => {
  try {
    // In a real app, you would clear Redis cache, temp files, etc.
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system logs (placeholder)
router.get('/logs', auth, authorize('admin'), async (req, res) => {
  try {
    // In a real app, you would read from log files
    const logs = [
      `[${new Date().toISOString()}] System started`,
      `[${new Date().toISOString()}] User ${req.user.username} accessed logs`,
      `[${new Date().toISOString()}] Database connection established`
    ];
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

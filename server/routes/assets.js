const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all assets
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let sql = 'SELECT * FROM assets WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR asset_code LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const assets = await db.all(sql, params);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get asset by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await db.get('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const documents = await db.all('SELECT * FROM asset_documents WHERE asset_id = ?', [req.params.id]);
    const history = await db.all('SELECT * FROM asset_history WHERE asset_id = ? ORDER BY performed_at DESC', [req.params.id]);

    res.json({ ...asset, documents, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create asset
router.post('/', auth, authorize('admin', 'asset_manager'), [
  body('asset_code').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('category').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { asset_code, name, category, description, purchase_date, purchase_price, 
            current_value, depreciation_rate, status, location, department, condition, warranty_expiry } = req.body;

    const result = await db.run(
      `INSERT INTO assets (asset_code, name, category, description, purchase_date, purchase_price, 
       current_value, depreciation_rate, status, location, department, condition, warranty_expiry, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_code, name, category, description, purchase_date, purchase_price, current_value, 
       depreciation_rate, status || 'available', location, department, condition, warranty_expiry, req.user.id]
    );

    await db.run(
      'INSERT INTO asset_history (asset_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
      [result.id, 'CREATED', `Asset created by ${req.user.username}`, req.user.id]
    );

    res.status(201).json({ id: result.id, message: 'Asset created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update asset
router.put('/:id', auth, authorize('admin', 'asset_manager'), async (req, res) => {
  try {
    const { name, category, description, purchase_date, purchase_price, current_value, 
            depreciation_rate, status, location, department, condition, warranty_expiry, assigned_to } = req.body;

    await db.run(
      `UPDATE assets SET name = ?, category = ?, description = ?, purchase_date = ?, 
       purchase_price = ?, current_value = ?, depreciation_rate = ?, status = ?, location = ?, 
       department = ?, condition = ?, warranty_expiry = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, category, description, purchase_date, purchase_price, current_value, depreciation_rate, 
       status, location, department, condition, warranty_expiry, assigned_to, req.params.id]
    );

    await db.run(
      'INSERT INTO asset_history (asset_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
      [req.params.id, 'UPDATED', `Asset updated by ${req.user.username}`, req.user.id]
    );

    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete asset
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.run('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload asset document
router.post('/:id/documents', auth, (req, res, next) => {
  req.uploadPath = 'uploads/assets';
  next();
}, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { document_type } = req.body;
    await db.run(
      'INSERT INTO asset_documents (asset_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
      [req.params.id, document_type, req.file.originalname, req.file.path]
    );

    res.json({ message: 'Document uploaded successfully', file: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

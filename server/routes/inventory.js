const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, lowStock } = req.query;
    let sql = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (lowStock === 'true') {
      sql += ' AND current_stock <= min_stock';
    }

    sql += ' ORDER BY name';
    const items = await db.all(sql, params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await db.get('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const transactions = await db.all(
      'SELECT * FROM inventory_transactions WHERE item_id = ? ORDER BY transaction_date DESC LIMIT 50',
      [req.params.id]
    );

    res.json({ ...item, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create inventory item
router.post('/', auth, authorize('admin', 'inventory_manager'), [
  body('item_code').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('category').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { item_code, name, category, description, unit, current_stock, min_stock, max_stock, unit_price, location } = req.body;

    const result = await db.run(
      `INSERT INTO inventory (item_code, name, category, description, unit, current_stock, min_stock, max_stock, unit_price, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_code, name, category, description, unit, current_stock || 0, min_stock || 0, max_stock, unit_price, location]
    );

    res.status(201).json({ id: result.id, message: 'Item created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory item
router.put('/:id', auth, authorize('admin', 'inventory_manager'), async (req, res) => {
  try {
    const { name, category, description, unit, min_stock, max_stock, unit_price, location, status } = req.body;

    await db.run(
      `UPDATE inventory SET name = ?, category = ?, description = ?, unit = ?, min_stock = ?, 
       max_stock = ?, unit_price = ?, location = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, category, description, unit, min_stock, max_stock, unit_price, location, status, req.params.id]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', auth, authorize('admin', 'inventory_manager'), async (req, res) => {
  try {
    await db.run('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock transaction (add/remove)
router.post('/:id/transaction', auth, authorize('admin', 'inventory_manager'), [
  body('transaction_type').isIn(['in', 'out', 'adjustment']),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { transaction_type, quantity, reference_no, notes } = req.body;
    const item = await db.get('SELECT current_stock FROM inventory WHERE id = ?', [req.params.id]);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    let newStock = item.current_stock;
    if (transaction_type === 'in') {
      newStock += quantity;
    } else if (transaction_type === 'out') {
      newStock -= quantity;
      if (newStock < 0) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    } else {
      newStock = quantity;
    }

    await db.run('UPDATE inventory SET current_stock = ? WHERE id = ?', [newStock, req.params.id]);
    await db.run(
      'INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_no, notes, performed_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, transaction_type, quantity, reference_no, notes, req.user.id]
    );

    res.json({ message: 'Transaction recorded successfully', new_stock: newStock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get suppliers
router.get('/suppliers/all', auth, async (req, res) => {
  try {
    const suppliers = await db.all('SELECT * FROM suppliers ORDER BY name');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create supplier
router.post('/suppliers', auth, authorize('admin', 'inventory_manager'), [
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    const result = await db.run(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, address]
    );
    res.status(201).json({ id: result.id, message: 'Supplier created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

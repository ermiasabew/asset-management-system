const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all rental properties
router.get('/', auth, async (req, res) => {
  try {
    const { status, property_type } = req.query;
    let sql = 'SELECT * FROM rental_properties WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (property_type) {
      sql += ' AND property_type = ?';
      params.push(property_type);
    }

    sql += ' ORDER BY name';
    const properties = await db.all(sql, params);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await db.get('SELECT * FROM rental_properties WHERE id = ?', [req.params.id]);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const tenants = await db.all('SELECT * FROM tenants WHERE property_id = ?', [req.params.id]);
    res.json({ ...property, tenants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create rental property
router.post('/', auth, authorize('admin', 'asset_manager'), [
  body('property_code').notEmpty().trim(),
  body('property_type').notEmpty(),
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_code, property_type, name, address, size, rooms, monthly_rent, description } = req.body;
    const result = await db.run(
      'INSERT INTO rental_properties (property_code, property_type, name, address, size, rooms, monthly_rent, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [property_code, property_type, name, address, size, rooms, monthly_rent, description]
    );

    res.status(201).json({ id: result.id, message: 'Property created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update property
router.put('/:id', auth, authorize('admin', 'asset_manager'), async (req, res) => {
  try {
    const { property_type, name, address, size, rooms, monthly_rent, status, description } = req.body;
    await db.run(
      'UPDATE rental_properties SET property_type = ?, name = ?, address = ?, size = ?, rooms = ?, monthly_rent = ?, status = ?, description = ? WHERE id = ?',
      [property_type, name, address, size, rooms, monthly_rent, status, description, req.params.id]
    );
    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add tenant
router.post('/:id/tenants', auth, authorize('admin', 'asset_manager'), [
  body('tenant_name').notEmpty().trim()
], async (req, res) => {
  try {
    const { tenant_name, phone, email, id_number, contract_start, contract_end, monthly_rent, deposit_amount } = req.body;
    const result = await db.run(
      'INSERT INTO tenants (property_id, tenant_name, phone, email, id_number, contract_start, contract_end, monthly_rent, deposit_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, tenant_name, phone, email, id_number, contract_start, contract_end, monthly_rent, deposit_amount]
    );

    await db.run('UPDATE rental_properties SET status = ? WHERE id = ?', ['rented', req.params.id]);

    res.status(201).json({ id: result.id, message: 'Tenant added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record rent payment
router.post('/tenants/:tenantId/payments', auth, authorize('admin', 'accountant'), [
  body('amount').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const { payment_date, amount, payment_method, reference_no, notes } = req.body;
    await db.run(
      'INSERT INTO rent_payments (tenant_id, payment_date, amount, payment_method, reference_no, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.tenantId, payment_date, amount, payment_method, reference_no, notes]
    );
    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tenant payments
router.get('/tenants/:tenantId/payments', auth, async (req, res) => {
  try {
    const payments = await db.all(
      'SELECT * FROM rent_payments WHERE tenant_id = ? ORDER BY payment_date DESC',
      [req.params.tenantId]
    );
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

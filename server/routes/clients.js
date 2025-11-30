const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const clients = await db.all('SELECT * FROM clients ORDER BY name');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const contracts = await db.all('SELECT * FROM service_contracts WHERE client_id = ?', [req.params.id]);
    const assignments = await db.all(
      `SELECT ea.*, e.first_name, e.last_name, e.category FROM employee_assignments ea
       JOIN employees e ON ea.employee_id = e.id WHERE ea.client_id = ?`,
      [req.params.id]
    );

    res.json({ ...client, contracts, assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post('/', auth, authorize('admin', 'client_manager'), [
  body('client_code').notEmpty().trim(),
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { client_code, name, type, contact_person, email, phone, address } = req.body;
    const result = await db.run(
      'INSERT INTO clients (client_code, name, type, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client_code, name, type, contact_person, email, phone, address]
    );

    res.status(201).json({ id: result.id, message: 'Client created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:id', auth, authorize('admin', 'client_manager'), async (req, res) => {
  try {
    const { name, type, contact_person, email, phone, address, status } = req.body;
    await db.run(
      'UPDATE clients SET name = ?, type = ?, contact_person = ?, email = ?, phone = ?, address = ?, status = ? WHERE id = ?',
      [name, type, contact_person, email, phone, address, status, req.params.id]
    );
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create service contract
router.post('/:id/contracts', auth, authorize('admin', 'client_manager'), [
  body('contract_number').notEmpty().trim(),
  body('service_type').notEmpty()
], async (req, res) => {
  try {
    const { contract_number, service_type, start_date, end_date, monthly_fee, terms } = req.body;
    const result = await db.run(
      'INSERT INTO service_contracts (contract_number, client_id, service_type, start_date, end_date, monthly_fee, terms) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [contract_number, req.params.id, service_type, start_date, end_date, monthly_fee, terms]
    );
    res.status(201).json({ id: result.id, message: 'Contract created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign employee to client
router.post('/:id/assign-employee', auth, authorize('admin', 'client_manager'), [
  body('employee_id').isInt(),
  body('location').notEmpty()
], async (req, res) => {
  try {
    const { employee_id, contract_id, location, start_date, end_date } = req.body;
    const result = await db.run(
      'INSERT INTO employee_assignments (employee_id, client_id, contract_id, location, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, req.params.id, contract_id, location, start_date, end_date]
    );
    res.status(201).json({ id: result.id, message: 'Employee assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

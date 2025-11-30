const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, docStatus, guarantee, search } = req.query;
    
    // Get employees with document and guarantor counts
    let sql = `
      SELECT e.*, 
        COALESCE((SELECT COUNT(*) FROM employee_documents WHERE employee_id = e.id), 0) as doc_count,
        COALESCE((SELECT COUNT(*) FROM guarantors WHERE employee_id = e.id), 0) as guarantor_count,
        COALESCE((SELECT COUNT(*) FROM guarantors WHERE employee_id = e.id AND verification_status = 'verified'), 0) as verified_guarantors,
        COALESCE((SELECT COUNT(*) FROM guarantors WHERE employee_id = e.id AND verification_status = 'rejected'), 0) as rejected_guarantors
      FROM employees e WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND e.category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND e.employment_status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR e.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY e.created_at DESC';
    let employees = await db.all(sql, params);

    // Add full_name if it doesn't exist
    employees = employees.map(e => ({
      ...e,
      full_name: e.full_name || `${e.first_name} ${e.last_name}`
    }));

    // Apply client-side filters for document and guarantee status
    if (docStatus === 'complete') {
      employees = employees.filter(e => e.doc_count >= 3); // Assuming 3 required docs
    } else if (docStatus === 'incomplete') {
      employees = employees.filter(e => e.doc_count < 3);
    }

    if (guarantee === 'verified') {
      employees = employees.filter(e => e.verified_guarantors > 0);
    } else if (guarantee === 'expired') {
      // For now, treat "expired" as "rejected" since we don't have expiry_date
      employees = employees.filter(e => e.rejected_guarantors > 0);
    } else if (guarantee === 'missing') {
      employees = employees.filter(e => e.guarantor_count === 0);
    }

    res.json(employees);
  } catch (error) {
    console.error('Error loading employees:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export employees to CSV
router.get('/export', auth, async (req, res) => {
  try {
    const { category, status, docStatus, guarantee, search, gender, position, minSalary, maxSalary } = req.query;
    let sql = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM employee_documents WHERE employee_id = e.id) as doc_count,
        (SELECT COUNT(*) FROM guarantors WHERE employee_id = e.id) as guarantor_count,
        (SELECT COUNT(*) FROM guarantors WHERE employee_id = e.id AND verification_status = 'verified') as verified_guarantors,
        (SELECT COUNT(*) FROM guarantors WHERE employee_id = e.id AND verification_status = 'rejected') as rejected_guarantors
      FROM employees e WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND e.category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND e.employment_status = ?';
      params.push(status);
    }
    if (gender) {
      sql += ' AND e.gender = ?';
      params.push(gender);
    }
    if (position) {
      sql += ' AND e.position LIKE ?';
      params.push(`%${position}%`);
    }
    if (minSalary) {
      sql += ' AND e.salary >= ?';
      params.push(parseFloat(minSalary));
    }
    if (maxSalary) {
      sql += ' AND e.salary <= ?';
      params.push(parseFloat(maxSalary));
    }
    if (search) {
      sql += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR e.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY e.employee_code';
    let employees = await db.all(sql, params);

    // Apply additional filters
    if (docStatus === 'complete') {
      employees = employees.filter(e => e.doc_count >= 3); // Assuming 3 required docs
    } else if (docStatus === 'incomplete') {
      employees = employees.filter(e => e.doc_count < 3);
    }

    if (guarantee === 'verified') {
      employees = employees.filter(e => e.verified_guarantors > 0);
    } else if (guarantee === 'expired') {
      employees = employees.filter(e => e.rejected_guarantors > 0);
    } else if (guarantee === 'missing') {
      employees = employees.filter(e => e.guarantor_count === 0);
    }

    // Generate CSV
    const headers = [
      'Employee Code', 'Full Name', 'First Name', 'Last Name', 'Grandfather Name', 'Gender',
      'Category', 'Position', 'Phone', 'Email', 'Hire Date', 'Date of Birth', 'National ID',
      'Address', 'Emergency Contact', 'Emergency Phone', 'Salary (ETB)', 'Bank Account',
      'Status', 'Documents', 'Guarantors', 'Verified Guarantors', 'Rejected Guarantors'
    ];

    const rows = employees.map(e => [
      e.employee_code,
      e.full_name || `${e.first_name} ${e.last_name} ${e.grandfather_name || ''}`.trim(),
      e.first_name,
      e.last_name,
      e.grandfather_name || '',
      e.gender || '',
      e.category,
      e.position,
      e.phone,
      e.email,
      e.hire_date,
      e.date_of_birth || '',
      e.national_id || '',
      e.address || '',
      e.emergency_contact || '',
      e.emergency_phone || '',
      e.salary || '',
      e.bank_account || '',
      e.employment_status,
      e.doc_count,
      e.guarantor_count,
      e.verified_guarantors,
      e.rejected_guarantors
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import employees from CSV
router.post('/import', auth, authorize('admin', 'hr_manager'), upload.single('file'), async (req, res) => {
  try {
    console.log('Import request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    console.log('CSV Content length:', csvContent.length);
    
    // Better CSV parsing that handles quoted fields
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    console.log('Total lines:', lines.length);
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);
    
    const skipDuplicates = req.body.skipDuplicates === 'true';
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const employee = {};
        
        headers.forEach((header, index) => {
          employee[header] = values[index] || null;
        });

        console.log(`Processing row ${i}:`, employee.employee_code);

        // Validate required fields
        if (!employee.employee_code || !employee.first_name || !employee.last_name) {
          errorDetails.push(`Row ${i + 1}: Missing required fields`);
          errors++;
          continue;
        }

        // Check for duplicate
        if (skipDuplicates) {
          const existing = await db.get('SELECT id FROM employees WHERE employee_code = ?', [employee.employee_code]);
          if (existing) {
            console.log(`Skipping duplicate: ${employee.employee_code}`);
            skipped++;
            continue;
          }
        }

        // Create full_name from first and last name
        const fullName = `${employee.first_name} ${employee.last_name}`;
        
        // Insert employee
        await db.run(
          `INSERT INTO employees (
            employee_code, first_name, last_name, full_name, category, position, phone, email,
            hire_date, date_of_birth, national_id, address, emergency_contact,
            emergency_phone, salary, bank_account, employment_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employee.employee_code,
            employee.first_name,
            employee.last_name,
            fullName,
            employee.category || 'Admin Staff',
            employee.position || 'Staff',
            employee.phone,
            employee.email,
            employee.hire_date,
            employee.date_of_birth,
            employee.national_id,
            employee.address,
            employee.emergency_contact,
            employee.emergency_phone,
            employee.salary,
            employee.bank_account,
            employee.status || 'active'
          ]
        );
        console.log(`Imported: ${employee.employee_code}`);
        imported++;
      } catch (err) {
        console.error(`Error importing row ${i}:`, err.message);
        errorDetails.push(`Row ${i + 1}: ${err.message}`);
        errors++;
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.error('Failed to delete temp file:', e);
    }

    console.log(`Import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);

    res.json({
      message: 'Import completed',
      imported,
      skipped,
      errors,
      errorDetails: errorDetails.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message || 'Import failed' });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const documents = await db.all('SELECT * FROM employee_documents WHERE employee_id = ?', [req.params.id]);
    const guarantors = await db.all('SELECT * FROM guarantors WHERE employee_id = ?', [req.params.id]);
    
    // Fetch documents for each guarantor
    for (let guarantor of guarantors) {
      guarantor.documents = await db.all('SELECT * FROM guarantor_documents WHERE guarantor_id = ?', [guarantor.id]);
    }
    
    const assignments = await db.all(
      `SELECT ea.*, c.name as client_name FROM employee_assignments ea 
       LEFT JOIN clients c ON ea.client_id = c.id 
       WHERE ea.employee_id = ?`,
      [req.params.id]
    );

    res.json({ ...employee, documents, guarantors, assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
router.post('/', auth, authorize('admin', 'hr_manager'), [
  body('employee_code').notEmpty().trim(),
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('grandfather_name').notEmpty().trim(),
  body('category').notEmpty(),
  body('gender').notEmpty(),
  body('date_of_birth').notEmpty(),
  body('phone').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('position').notEmpty().trim(),
  body('hire_date').notEmpty(),
  body('salary').notEmpty(),
  body('bank_account').notEmpty().trim(),
  body('emergency_contact').notEmpty().trim(),
  body('emergency_phone').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employee_code, first_name, last_name, grandfather_name, category, position, email, phone, 
            address, date_of_birth, gender, national_id, hire_date, salary, bank_account, skills, 
            emergency_contact, emergency_phone } = req.body;

    // Generate full_name
    const full_name = `${first_name} ${last_name} ${grandfather_name}`;

    const result = await db.run(
      `INSERT INTO employees (employee_code, first_name, last_name, grandfather_name, full_name, 
       category, position, email, phone, address, date_of_birth, gender, national_id, hire_date, 
       salary, bank_account, skills, emergency_contact, emergency_phone, employment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_code, first_name, last_name, grandfather_name, full_name, category, position, email, 
       phone, address, date_of_birth, gender, national_id, hire_date, salary, bank_account, skills, 
       emergency_contact, emergency_phone, 'active']
    );

    res.status(201).json({ id: result.id, message: 'Employee created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', auth, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const { first_name, last_name, grandfather_name, category, position, email, phone, address, 
            date_of_birth, gender, national_id, salary, bank_account, employment_status, skills, 
            emergency_contact, emergency_phone } = req.body;

    // Generate full_name
    const full_name = `${first_name} ${last_name} ${grandfather_name}`;

    await db.run(
      `UPDATE employees SET first_name = ?, last_name = ?, grandfather_name = ?, full_name = ?, 
       category = ?, position = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, gender = ?, 
       national_id = ?, salary = ?, bank_account = ?, employment_status = ?, skills = ?, 
       emergency_contact = ?, emergency_phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [first_name, last_name, grandfather_name, full_name, category, position, email, phone, address, 
       date_of_birth, gender, national_id, salary, bank_account, employment_status, skills, 
       emergency_contact, emergency_phone, req.params.id]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload employee document
router.post('/:id/documents', auth, (req, res, next) => {
  console.log('=== EMPLOYEE DOCUMENT UPLOAD ROUTE HIT ===');
  console.log('Employee ID:', req.params.id);
  req.uploadPath = 'uploads/employees';
  next();
}, upload.single('file'), async (req, res) => {
  console.log('=== AFTER MULTER UPLOAD ===');
  console.log('File received:', req.file ? 'YES' : 'NO');
  
  try {
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { document_type, expiry_date } = req.body;
    console.log('Document type:', document_type);
    
    // Get employee name
    const employee = await db.get('SELECT first_name, last_name FROM employees WHERE id = ?', [req.params.id]);
    
    console.log('Employee document upload:');
    console.log('- Employee ID:', req.params.id);
    console.log('- Employee found:', employee);
    console.log('- Original file:', req.file.originalname);
    console.log('- Temp path:', req.file.path);
    
    if (employee) {
      const fs = require('fs');
      const path = require('path');
      
      // Create meaningful filename: employeename.ext
      const employeeName = `${employee.first_name}${employee.last_name}`.replace(/\s+/g, '').toLowerCase();
      const ext = path.extname(req.file.originalname);
      const docType = document_type.replace(/\s+/g, '').toLowerCase();
      
      // Check if file exists and add counter if needed
      let newFileName = `${employeeName}_${docType}${ext}`;
      let newFilePath = path.join('uploads/employees', newFileName);
      let counter = 1;
      
      console.log('- New filename:', newFileName);
      console.log('- New path:', newFilePath);
      
      while (fs.existsSync(newFilePath)) {
        newFileName = `${employeeName}_${docType}_${counter}${ext}`;
        newFilePath = path.join('uploads/employees', newFileName);
        counter++;
      }
      
      if (counter > 1) {
        console.log('- Duplicate found, using:', newFileName);
      }
      
      // Rename file
      console.log('- Renaming from:', req.file.path);
      console.log('- Renaming to:', newFilePath);
      fs.renameSync(req.file.path, newFilePath);
      console.log('- Rename successful!');
      
      // Save to database with new filename
      await db.run(
        'INSERT INTO employee_documents (employee_id, document_type, file_name, file_path, expiry_date) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, document_type, newFileName, newFilePath, expiry_date]
      );
    } else {
      // Fallback to original filename if employee not found
      await db.run(
        'INSERT INTO employee_documents (employee_id, document_type, file_name, file_path, expiry_date) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, document_type, req.file.originalname, req.file.path, expiry_date]
      );
    }

    res.json({ message: 'Document uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add guarantor
router.post('/:id/guarantors', auth, authorize('admin', 'hr_manager'), [
  body('guarantor_name').notEmpty().trim()
], async (req, res) => {
  try {
    const { guarantor_name, guarantor_type, relationship, phone, email, address, id_number } = req.body;
    
    const result = await db.run(
      `INSERT INTO guarantors (employee_id, guarantor_name, guarantor_type, relationship, phone, email, address, id_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, guarantor_name, guarantor_type, relationship, phone, email, address, id_number]
    );

    res.status(201).json({ id: result.id, message: 'Guarantor added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload guarantor document
router.post('/guarantors/:guarantorId/documents', auth, (req, res, next) => {
  console.log('=== GUARANTOR DOCUMENT UPLOAD ROUTE HIT ===');
  console.log('Guarantor ID:', req.params.guarantorId);
  req.uploadPath = 'uploads/guarantors';
  next();
}, upload.single('file'), async (req, res) => {
  console.log('=== AFTER MULTER UPLOAD (GUARANTOR) ===');
  console.log('File received:', req.file ? 'YES' : 'NO');
  
  try {
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { document_type } = req.body;
    const guarantorId = req.params.guarantorId;
    console.log('Document type:', document_type);
    
    // Get guarantor and employee names
    const guarantor = await db.get(`
      SELECT g.guarantor_name, e.first_name, e.last_name 
      FROM guarantors g
      JOIN employees e ON g.employee_id = e.id
      WHERE g.id = ?
    `, [guarantorId]);
    
    if (guarantor) {
      const fs = require('fs');
      const path = require('path');
      
      // Create meaningful filename: employeename_guarantorname_doctype.ext
      const employeeName = `${guarantor.first_name}${guarantor.last_name}`.replace(/\s+/g, '').toLowerCase();
      const guarantorName = guarantor.guarantor_name.replace(/\s+/g, '').toLowerCase();
      const docType = document_type.replace(/\s+/g, '').toLowerCase();
      const ext = path.extname(req.file.originalname);
      
      // Check if file exists and add counter if needed
      let newFileName = `${employeeName}_${guarantorName}_${docType}${ext}`;
      let newFilePath = path.join('uploads/guarantors', newFileName);
      let counter = 1;
      
      while (fs.existsSync(newFilePath)) {
        newFileName = `${employeeName}_${guarantorName}_${docType}_${counter}${ext}`;
        newFilePath = path.join('uploads/guarantors', newFileName);
        counter++;
      }
      
      // Rename file
      fs.renameSync(req.file.path, newFilePath);
      
      console.log('Guarantor document saved as:', newFileName);
      
      // Save to database with new filename
      await db.run(
        'INSERT INTO guarantor_documents (guarantor_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
        [guarantorId, document_type, newFileName, newFilePath]
      );
    } else {
      // Fallback to original filename if guarantor not found
      await db.run(
        'INSERT INTO guarantor_documents (guarantor_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
        [guarantorId, document_type, req.file.originalname, req.file.path]
      );
    }

    res.json({ message: 'Guarantor document uploaded successfully' });
  } catch (error) {
    console.error('Error uploading guarantor document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete employee document
router.delete('/documents/:docId', auth, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const doc = await db.get('SELECT * FROM employee_documents WHERE id = ?', [req.params.docId]);
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    const fs = require('fs');
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    await db.run('DELETE FROM employee_documents WHERE id = ?', [req.params.docId]);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record attendance
router.post('/:id/attendance', auth, async (req, res) => {
  try {
    const { date, check_in, check_out, status, notes } = req.body;
    
    await db.run(
      'INSERT INTO attendance (employee_id, date, check_in, check_out, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, date, check_in, check_out, status, notes]
    );

    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee attendance
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = 'SELECT * FROM attendance WHERE employee_id = ?';
    const params = [req.params.id];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY date DESC LIMIT 100';
    const attendance = await db.all(sql, params);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee documents from filesystem
    const fs = require('fs');
    const documents = await db.all('SELECT file_path FROM employee_documents WHERE employee_id = ?', [req.params.id]);
    documents.forEach(doc => {
      if (fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
    });

    // Delete guarantor documents from filesystem
    const guarantors = await db.all('SELECT id FROM guarantors WHERE employee_id = ?', [req.params.id]);
    for (const guarantor of guarantors) {
      const guarantorDocs = await db.all('SELECT file_path FROM guarantor_documents WHERE guarantor_id = ?', [guarantor.id]);
      guarantorDocs.forEach(doc => {
        if (fs.existsSync(doc.file_path)) {
          fs.unlinkSync(doc.file_path);
        }
      });
    }

    // Delete employee (cascade will handle related records)
    await db.run('DELETE FROM employees WHERE id = ?', [req.params.id]);

    await db.run(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'DELETE_EMPLOYEE', `Deleted employee ${employee.first_name} ${employee.last_name} (ID: ${req.params.id})`]
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete guarantor
router.delete('/guarantors/:id', auth, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const guarantor = await db.get('SELECT * FROM guarantors WHERE id = ?', [req.params.id]);
    
    if (!guarantor) {
      return res.status(404).json({ error: 'Guarantor not found' });
    }

    // Delete guarantor documents from filesystem
    const fs = require('fs');
    const documents = await db.all('SELECT file_path FROM guarantor_documents WHERE guarantor_id = ?', [req.params.id]);
    documents.forEach(doc => {
      if (fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
    });

    // Delete guarantor
    await db.run('DELETE FROM guarantors WHERE id = ?', [req.params.id]);

    res.json({ message: 'Guarantor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update guarantor verification status
router.put('/guarantors/:id/verify', auth, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const { verification_status } = req.body;
    
    if (!['pending', 'verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    await db.run(
      'UPDATE guarantors SET verification_status = ? WHERE id = ?',
      [verification_status, req.params.id]
    );

    res.json({ message: 'Verification status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Delete guarantor document
router.delete('/guarantors/documents/:docId', auth, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    // Get document info before deleting
    const document = await db.get('SELECT * FROM guarantor_documents WHERE id = ?', [req.params.docId]);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete from database
    await db.run('DELETE FROM guarantor_documents WHERE id = ?', [req.params.docId]);
    
    // Delete file from filesystem
    const fs = require('fs');
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }
    
    res.json({ message: 'Guarantor document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

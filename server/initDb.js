const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      full_name TEXT,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Assets table
    `CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      purchase_date DATE,
      purchase_price REAL,
      current_value REAL,
      depreciation_rate REAL,
      status TEXT DEFAULT 'available',
      location TEXT,
      assigned_to INTEGER,
      department TEXT,
      condition TEXT,
      warranty_expiry DATE,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES employees(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Asset documents
    `CREATE TABLE IF NOT EXISTS asset_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      document_type TEXT,
      file_name TEXT,
      file_path TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
    )`,

    // Asset history
    `CREATE TABLE IF NOT EXISTS asset_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      performed_by INTEGER,
      performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (performed_by) REFERENCES users(id)
    )`,

    // Inventory items
    `CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      unit TEXT,
      current_stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      max_stock INTEGER,
      unit_price REAL,
      location TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Inventory transactions
    `CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reference_no TEXT,
      notes TEXT,
      performed_by INTEGER,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE,
      FOREIGN KEY (performed_by) REFERENCES users(id)
    )`,

    // Suppliers
    `CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Purchase orders
    `CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER,
      order_date DATE,
      expected_delivery DATE,
      status TEXT DEFAULT 'pending',
      total_amount REAL,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Purchase order items
    `CREATE TABLE IF NOT EXISTS po_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL,
      total_price REAL,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES inventory(id)
    )`,

    // Employees
    `CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_code TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      category TEXT NOT NULL,
      position TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      date_of_birth DATE,
      hire_date DATE,
      salary REAL,
      employment_status TEXT DEFAULT 'active',
      skills TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Employee documents
    `CREATE TABLE IF NOT EXISTS employee_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      file_name TEXT,
      file_path TEXT,
      expiry_date DATE,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )`,

    // Guarantors
    `CREATE TABLE IF NOT EXISTS guarantors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      guarantor_name TEXT NOT NULL,
      guarantor_type TEXT,
      relationship TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      id_number TEXT,
      verification_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )`,

    // Guarantor documents
    `CREATE TABLE IF NOT EXISTS guarantor_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guarantor_id INTEGER NOT NULL,
      document_type TEXT,
      file_name TEXT,
      file_path TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guarantor_id) REFERENCES guarantors(id) ON DELETE CASCADE
    )`,

    // Attendance
    `CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date DATE NOT NULL,
      check_in TIME,
      check_out TIME,
      status TEXT,
      notes TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )`,

    // Clients
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Service contracts
    `CREATE TABLE IF NOT EXISTS service_contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_number TEXT UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,
      start_date DATE,
      end_date DATE,
      monthly_fee REAL,
      status TEXT DEFAULT 'active',
      terms TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )`,

    // Employee assignments
    `CREATE TABLE IF NOT EXISTS employee_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      contract_id INTEGER,
      location TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (contract_id) REFERENCES service_contracts(id)
    )`,

    // Rental properties
    `CREATE TABLE IF NOT EXISTS rental_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_code TEXT UNIQUE NOT NULL,
      property_type TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      size TEXT,
      rooms INTEGER,
      monthly_rent REAL,
      status TEXT DEFAULT 'available',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tenants
    `CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      tenant_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      id_number TEXT,
      contract_start DATE,
      contract_end DATE,
      monthly_rent REAL,
      deposit_amount REAL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (property_id) REFERENCES rental_properties(id)
    )`,

    // Rent payments
    `CREATE TABLE IF NOT EXISTS rent_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      payment_date DATE,
      amount REAL,
      payment_method TEXT,
      reference_no TEXT,
      notes TEXT,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )`,

    // Invoices
    `CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      invoice_date DATE,
      due_date DATE,
      total_amount REAL,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'unpaid',
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Audit logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      table_name TEXT,
      record_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  ];

  try {
    for (const table of tables) {
      await db.run(table);
    }
    console.log('✓ All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const insertDefaultData = async () => {
  try {
    // Default users with different roles
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@company.com',
        full_name: 'System Administrator',
        role: 'admin'
      },
      {
        username: 'assetmgr',
        password: 'asset123',
        email: 'assets@company.com',
        full_name: 'John Smith',
        role: 'asset_manager'
      },
      {
        username: 'invmgr',
        password: 'inventory123',
        email: 'inventory@company.com',
        full_name: 'Sarah Johnson',
        role: 'inventory_manager'
      },
      {
        username: 'hrmgr',
        password: 'hr123',
        email: 'hr@company.com',
        full_name: 'Mike Davis',
        role: 'hr_manager'
      },
      {
        username: 'clientmgr',
        password: 'client123',
        email: 'clients@company.com',
        full_name: 'Emily Brown',
        role: 'client_manager'
      },
      {
        username: 'accountant',
        password: 'account123',
        email: 'accounting@company.com',
        full_name: 'David Wilson',
        role: 'accountant'
      }
    ];

    console.log('\n✓ Creating default users...');
    
    for (const user of defaultUsers) {
      const exists = await db.get('SELECT id FROM users WHERE username = ?', [user.username]);
      
      if (!exists) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.run(
          `INSERT INTO users (username, password, email, full_name, role, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [user.username, hashedPassword, user.email, user.full_name, user.role, 'active']
        );
        console.log(`  ✓ Created user: ${user.username} (${user.role})`);
      } else {
        console.log(`  - User ${user.username} already exists`);
      }
    }

    console.log('\n✓ Database initialization completed successfully');
    console.log('\n📋 Default User Accounts:');
    console.log('┌─────────────┬──────────────┬─────────────────────┐');
    console.log('│ Username    │ Password     │ Role                │');
    console.log('├─────────────┼──────────────┼─────────────────────┤');
    console.log('│ admin       │ admin123     │ admin               │');
    console.log('│ assetmgr    │ asset123     │ asset_manager       │');
    console.log('│ invmgr      │ inventory123 │ inventory_manager   │');
    console.log('│ hrmgr       │ hr123        │ hr_manager          │');
    console.log('│ clientmgr   │ client123    │ client_manager      │');
    console.log('│ accountant  │ account123   │ accountant          │');
    console.log('└─────────────┴──────────────┴─────────────────────┘');
    console.log('\n⚠️  IMPORTANT: Change all default passwords after first login!\n');
    
  } catch (error) {
    console.error('Error inserting default data:', error);
    throw error;
  }
};

const init = async () => {
  try {
    // Create directories
    const dirs = ['database', 'uploads', 'uploads/assets', 'uploads/employees', 'uploads/guarantors'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    await db.connect();
    await createTables();
    await insertDefaultData();
    
    console.log('\n✓ Database initialized successfully!');
    console.log('You can now start the server with: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
};

init();

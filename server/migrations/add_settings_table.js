const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/company.db');

console.log('Running migration: add_settings_table');

db.serialize(() => {
  // Add phone column to users table if it doesn't exist
  db.run(`
    ALTER TABLE users ADD COLUMN phone TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding phone column:', err.message);
    } else {
      console.log('✓ Added phone column to users table');
    }
  });

  // Create settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      company_name TEXT DEFAULT 'Asset Management System',
      business_type TEXT,
      company_email TEXT,
      company_phone TEXT,
      company_address TEXT,
      tax_id TEXT,
      registration_number TEXT,
      currency TEXT DEFAULT 'ETB',
      date_format TEXT DEFAULT 'YYYY-MM-DD',
      timezone TEXT DEFAULT 'Africa/Addis_Ababa',
      items_per_page INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating settings table:', err.message);
    } else {
      console.log('✓ Created settings table');
      
      // Insert default settings
      db.run(`
        INSERT OR IGNORE INTO settings (id, company_name, currency, date_format, timezone, items_per_page)
        VALUES (1, 'Asset Management System', 'ETB', 'YYYY-MM-DD', 'Africa/Addis_Ababa', 10)
      `, (err) => {
        if (err) {
          console.error('Error inserting default settings:', err.message);
        } else {
          console.log('✓ Inserted default settings');
        }
        
        db.close();
        console.log('Migration completed!');
      });
    }
  });
});

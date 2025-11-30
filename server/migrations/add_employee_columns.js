const db = require('../config/database');

async function addEmployeeColumns() {
  try {
    await db.connect();
    
    console.log('Adding missing columns to employees table...');
    
    // Add national_id column
    try {
      await db.run('ALTER TABLE employees ADD COLUMN national_id TEXT');
      console.log('✓ Added national_id column');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('- national_id column already exists');
      } else {
        throw e;
      }
    }
    
    // Add bank_account column
    try {
      await db.run('ALTER TABLE employees ADD COLUMN bank_account TEXT');
      console.log('✓ Added bank_account column');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('- bank_account column already exists');
      } else {
        throw e;
      }
    }
    
    // Add full_name column
    try {
      await db.run('ALTER TABLE employees ADD COLUMN full_name TEXT');
      console.log('✓ Added full_name column');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('- full_name column already exists');
      } else {
        throw e;
      }
    }
    
    // Add grandfather_name column
    try {
      await db.run('ALTER TABLE employees ADD COLUMN grandfather_name TEXT');
      console.log('✓ Added grandfather_name column');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('- grandfather_name column already exists');
      } else {
        throw e;
      }
    }
    
    // Add gender column
    try {
      await db.run('ALTER TABLE employees ADD COLUMN gender TEXT');
      console.log('✓ Added gender column');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('- gender column already exists');
      } else {
        throw e;
      }
    }
    
    // Update full_name for existing employees
    await db.run(`UPDATE employees SET full_name = first_name || ' ' || last_name WHERE full_name IS NULL`);
    console.log('✓ Updated full_name for existing employees');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addEmployeeColumns();

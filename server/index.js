const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const inventoryRoutes = require('./routes/inventory');
const employeeRoutes = require('./routes/employees');
const clientRoutes = require('./routes/clients');
const rentalRoutes = require('./routes/rentals');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await db.connect();
    
    // Check if database is initialized
    const checkTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    
    if (!checkTable) {
      console.log('Database not initialized. Running initialization...');
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('node server/initDb.js', (error, stdout, stderr) => {
          if (error) {
            console.error('Init error:', error);
            reject(error);
          } else {
            console.log(stdout);
            resolve();
          }
        });
      });
      console.log('Database initialized successfully!');
    } else {
      console.log('Database already initialized');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✓ Server running on:`);
      console.log(`  - Local:   http://localhost:${PORT}`);
      console.log(`  - Network: http://192.168.1.3:${PORT}`);
      console.log(`✓ API available at http://192.168.1.3:${PORT}/api`);
      console.log(`\nDefault login: username=admin, password=admin123`);
      console.log(`\n📱 Access from phone: http://192.168.1.3:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

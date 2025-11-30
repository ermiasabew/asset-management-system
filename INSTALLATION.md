# Installation Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Node.js

**Windows:**
- Download from https://nodejs.org/
- Run the installer
- Verify installation:
```cmd
node --version
npm --version
```

### 2. Install Dependencies

Open Command Prompt in the project directory and run:

```cmd
npm install
```

This will install all required packages:
- express (web server)
- sqlite3 (database)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- multer (file uploads)
- cors (cross-origin requests)
- dotenv (environment variables)
- express-validator (input validation)
- node-cron (scheduled tasks)

### 3. Initialize Database

Create the database and tables:

```cmd
npm run init-db
```

This will:
- Create the SQLite database file
- Create all necessary tables
- Create default admin user (username: admin, password: admin123)
- Create upload directories

### 4. Start the Server

```cmd
npm run dev
```

The server will start on http://localhost:3000

### 5. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

**IMPORTANT:** Change the default password after first login!

## Configuration

### Environment Variables

Edit the `.env` file to customize settings:

```
PORT=3000                          # Server port
JWT_SECRET=your_secret_key         # Change this in production!
DB_PATH=./database/company.db      # Database location
UPLOAD_PATH=./uploads              # Upload directory
NODE_ENV=development               # Environment
```

### Security Notes

1. **Change JWT Secret:** Update `JWT_SECRET` in `.env` with a strong random string
2. **Change Admin Password:** Login and change the default admin password immediately
3. **File Permissions:** Ensure upload directories have proper permissions
4. **Backup Database:** Regularly backup the `database/company.db` file

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change the PORT in `.env` file:
```
PORT=3001
```

### Database Errors

If you encounter database errors, try reinitializing:
```cmd
del database\company.db
npm run init-db
```

### Module Not Found

If you get "module not found" errors:
```cmd
npm install
```

### Permission Errors

Run Command Prompt as Administrator if you encounter permission issues.

## Project Structure

```
├── server/                 # Backend code
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── initDb.js          # Database initialization
├── public/                # Frontend code
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── index.html        # Main HTML file
├── database/             # SQLite database (created on init)
├── uploads/              # Uploaded files (created on init)
├── package.json          # Dependencies
├── .env                  # Environment variables
└── README.md            # Documentation
```

## Features Overview

### 1. Asset Management
- Add, edit, delete assets
- Track asset status and location
- Asset depreciation tracking
- Document uploads
- Asset history logs

### 2. Inventory Management
- Stock level monitoring
- Low stock alerts
- Stock in/out transactions
- Supplier management
- Purchase orders

### 3. Employee Management
- Employee registration
- Document management
- Guarantor information
- Attendance tracking
- Employee assignments

### 4. Client Management
- Client registration
- Service contracts
- Employee assignments to clients
- Billing and invoicing

### 5. Rental Properties
- Property management
- Tenant management
- Rent payment tracking
- Contract management

### 6. Reports & Analytics
- Dashboard with statistics
- Asset utilization reports
- Employee distribution
- Inventory stock reports
- Revenue reports

### 7. Security Features
- JWT authentication
- Password hashing
- Role-based access control
- Audit logging
- Session management

### 8. UI Features
- Dark mode support
- Responsive design
- Real-time notifications
- Modern interface
- Easy navigation

## User Roles

The system supports multiple user roles:

- **Admin:** Full system access
- **Asset Manager:** Manage assets and properties
- **Inventory Manager:** Manage inventory and stock
- **HR Manager:** Manage employees
- **Client Manager:** Manage clients and contracts
- **Accountant:** View reports and manage payments

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the README.md file
3. Check server logs for error messages

## Backup

Regular backups are recommended:

```cmd
copy database\company.db database\company_backup_%date%.db
```

## Updates

To update dependencies:

```cmd
npm update
```

## Production Deployment

For production deployment:

1. Change `NODE_ENV` to `production` in `.env`
2. Use a strong `JWT_SECRET`
3. Set up proper SSL/HTTPS
4. Configure firewall rules
5. Set up regular database backups
6. Use a process manager (PM2)
7. Configure proper logging

## License

MIT License - See LICENSE file for details

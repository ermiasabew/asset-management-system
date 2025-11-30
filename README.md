# Asset and Inventory Management System

A complete, modern, and secure web-based management system for companies providing asset management, employee hiring services, and property rental management. Built with Node.js, Express, SQLite, and modern JavaScript with a beautiful dark mode UI.

## 🚀 Quick Start

```cmd
npm install          # Install dependencies
npm run init-db      # Create database
npm run dev          # Start server
```

Then open **http://localhost:3000** and login with:
- Username: `admin`
- Password: `admin123`

## ✨ Key Features

### 📦 Asset Management
- Track buildings, cars, houses, properties, office items, and machines
- Asset status tracking (Available, Rented, Assigned, Maintenance, Damaged)
- Depreciation calculation and tracking
- Asset history and audit logs
- Document uploads (contracts, receipts, photos)
- Location and department tracking

### 📊 Inventory Management
- Stock level monitoring with min/max thresholds
- Automatic low stock alerts
- Stock in/out transactions
- Supplier and vendor management
- Purchase order system
- Item categories: Cleaning materials, security equipment, office supplies, tools, uniforms

### 👥 Employee Management
- Complete HR system for hygiene workers, security guards, technicians, drivers, and admin staff
- Employee documents (ID, license, CV, medical certificates)
- Contract management
- Attendance and shift scheduling
- Skills and performance tracking
- Emergency contact information

### 🛡️ Guarantor System
- Store employee guarantor information
- Upload scanned guarantee documents
- Verification status tracking (Pending, Verified, Rejected)
- Guarantor types: Family, Friend, Employer
- Document expiry reminders

### 🏠 Rental Property Management
- Property catalog (houses, apartments, shops, offices)
- Tenant management
- Rent payment tracking
- Contract management with expiry alerts
- Maintenance tracking
- Revenue reporting

### 🤝 Client & Service Management
- Client registration and management
- Service contracts (cleaning, security, maintenance)
- Employee assignment to clients
- Billing and invoice generation
- Service duration and renewal tracking

### 📈 Dashboard & Reports
- Real-time statistics and analytics
- Asset utilization reports
- Employee distribution reports
- Inventory stock reports
- Monthly and annual revenue reports
- Export capabilities (PDF/Excel ready)

### 🔐 Security & Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Asset Manager, HR Manager, Inventory Manager, Accountant, Client Manager)
- Audit logging for all actions
- Session management

### 🎨 Modern UI
- Clean, intuitive interface
- Dark/Light mode toggle
- Fully responsive design
- Real-time notifications
- Search and filter functionality
- Mobile-friendly

## 📋 Installation

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

### Prerequisites
- Node.js 14 or higher
- npm (comes with Node.js)

### Quick Install
```cmd
# 1. Install dependencies
npm install

# 2. Initialize database (creates tables and default admin user)
npm run init-db

# 3. Start the server
npm run dev
```

### Default Login
- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript + Modern CSS
- **Authentication**: JWT
- **File Upload**: Multer

## Project Structure

```
├── server/           # Backend API
├── public/           # Frontend files
├── database/         # SQLite database
├── uploads/          # Uploaded documents
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- SQL injection prevention
- Input validation
- Audit logging

## API Documentation

API endpoints are available at `/api/` with the following modules:
- `/api/auth` - Authentication
- `/api/assets` - Asset management
- `/api/inventory` - Inventory control
- `/api/employees` - Employee management
- `/api/clients` - Client management
- `/api/rentals` - Property rentals
- `/api/reports` - Analytics and reports

## License

MIT


## 📁 Project Structure

```
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth & upload middleware
│   ├── routes/            # API endpoints
│   ├── index.js           # Server entry point
│   └── initDb.js          # Database initialization
├── public/                # Frontend
│   ├── css/              # Styles with dark mode
│   ├── js/               # JavaScript modules
│   └── index.html        # Main HTML
├── database/             # SQLite database (auto-created)
├── uploads/              # Uploaded files (auto-created)
├── package.json          # Dependencies
├── .env                  # Configuration
├── README.md            # This file
├── INSTALLATION.md      # Detailed setup guide
├── QUICKSTART.md        # Quick reference
├── FEATURES.md          # Complete feature list
└── PROJECT_SUMMARY.md   # Technical overview
```

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express.js
- SQLite3 (local database)
- JWT authentication
- Bcrypt password hashing
- Multer file uploads

**Frontend:**
- Vanilla JavaScript (no frameworks)
- Modern CSS3 with CSS variables
- Responsive design
- Font Awesome icons

## 📚 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Complete installation guide with troubleshooting
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference for common tasks
- **[FEATURES.md](FEATURES.md)** - Detailed feature list with checkmarks
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical overview and API documentation

## 🎯 Use Cases

This system is perfect for:
- Facility management companies
- Security service providers
- Cleaning service companies
- Property management firms
- Equipment rental businesses
- Companies with deployed workforce
- Organizations managing multiple assets and properties

## 🔑 User Roles

- **Admin** - Full system access
- **Asset Manager** - Manage assets and properties
- **Inventory Manager** - Control stock and supplies
- **HR Manager** - Manage employees and hiring
- **Client Manager** - Handle clients and contracts
- **Accountant** - View reports and manage billing

## 🌐 API Endpoints

All API endpoints are RESTful and return JSON:

- `/api/auth/*` - Authentication
- `/api/assets/*` - Asset management
- `/api/inventory/*` - Inventory control
- `/api/employees/*` - Employee management
- `/api/clients/*` - Client management
- `/api/rentals/*` - Property rentals
- `/api/reports/*` - Analytics and reports

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete API documentation.

## 🔒 Security Features

✓ Password hashing with bcrypt  
✓ JWT token authentication  
✓ Role-based access control  
✓ SQL injection prevention  
✓ Input validation  
✓ Audit logging  
✓ Session management  
✓ Secure file uploads  

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari
- Opera

## 💾 Database

The system uses SQLite3 for easy deployment and portability:
- No external database server required
- Single file database
- Easy backup and restore
- Can migrate to PostgreSQL/MySQL if needed

**Database includes 20+ tables:**
- Users, Assets, Inventory, Employees, Clients
- Guarantors, Rentals, Tenants, Contracts
- Invoices, Payments, Notifications, Audit Logs
- And more...

## 🔄 Backup & Recovery

```cmd
# Backup database
copy database\company.db database\backup_%date%.db

# Restore database
copy database\backup_YYYYMMDD.db database\company.db
```

## 🐛 Troubleshooting

**Port already in use:**
Change `PORT` in `.env` file

**Database errors:**
```cmd
del database\company.db
npm run init-db
```

**Module not found:**
```cmd
npm install
```

See [INSTALLATION.md](INSTALLATION.md) for more troubleshooting tips.

## 🚀 Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` in `.env` to a strong random string
2. Change default admin password
3. Set `NODE_ENV=production` in `.env`
4. Configure HTTPS/SSL
5. Set up regular database backups
6. Configure firewall rules
7. Use a process manager (PM2)
8. Set up monitoring and logging

## 📊 System Requirements

- **OS**: Windows, macOS, or Linux
- **Node.js**: Version 14 or higher
- **RAM**: 512MB minimum
- **Disk**: 100MB minimum
- **Browser**: Modern browser with JavaScript enabled

## 🎨 Features Highlights

### Dark Mode
Toggle between light and dark themes with a single click. Theme preference is saved automatically.

### Real-time Notifications
Get instant alerts for:
- Low stock items
- Document expiry
- Contract renewals
- Rent due dates
- Maintenance schedules

### Search & Filter
Powerful search and filtering across all modules:
- Search by name, code, or description
- Filter by category, status, date range
- Sort by any column
- Quick access to records

### Document Management
Upload and manage documents:
- Asset contracts and receipts
- Employee IDs and certificates
- Guarantor documents
- Property agreements
- Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX

## 📈 Performance

- Fast SQLite queries
- Optimized data loading
- Efficient caching
- Minimal resource usage
- Quick response times

## 🔧 Configuration

Edit `.env` file to customize:

```env
PORT=3000                          # Server port
JWT_SECRET=your_secret_key         # JWT secret (change this!)
DB_PATH=./database/company.db      # Database location
UPLOAD_PATH=./uploads              # Upload directory
NODE_ENV=development               # Environment
```

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

This is a complete, production-ready system. Feel free to:
- Fork and modify for your needs
- Add new features
- Improve existing functionality
- Report issues
- Submit pull requests

## 📞 Support

For help and support:
1. Check the documentation files
2. Review troubleshooting section
3. Check server logs for errors
4. Review code comments

## ✅ What's Included

✓ Complete backend API with 7 modules  
✓ Modern frontend with dark mode  
✓ 20+ database tables  
✓ User authentication & authorization  
✓ File upload system  
✓ Real-time notifications  
✓ Comprehensive reporting  
✓ Audit logging  
✓ Search & filter functionality  
✓ Responsive design  
✓ Complete documentation  

## 🎯 Getting Started

1. **Install**: `npm install`
2. **Initialize**: `npm run init-db`
3. **Run**: `npm run dev`
4. **Login**: http://localhost:3000 (admin/admin123)
5. **Explore**: Navigate through all modules
6. **Customize**: Modify as needed for your business

## 📦 What You Get

- ✅ Complete source code
- ✅ Database schema and initialization
- ✅ API documentation
- ✅ User interface
- ✅ Authentication system
- ✅ File upload handling
- ✅ Notification system
- ✅ Reporting module
- ✅ Dark mode theme
- ✅ Responsive design
- ✅ Security features
- ✅ Documentation

## 🌟 Perfect For

- Small to medium businesses
- Facility management
- Service providers
- Property managers
- Equipment rental
- Workforce deployment
- Asset tracking
- Inventory control

---

**Status**: ✅ Complete and Ready to Use

**Version**: 1.0.0

**Last Updated**: 2024

For detailed information, see the documentation files included in the project.

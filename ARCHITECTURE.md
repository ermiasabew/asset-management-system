# System Architecture

## Overview

The Asset and Inventory Management System follows a modern three-tier architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Web Browser (Any Device)               │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │     │
│  │  │  HTML5   │  │   CSS3   │  │JavaScript│         │     │
│  │  │  Pages   │  │  Styles  │  │  Modules │         │     │
│  │  └──────────┘  └──────────┘  └──────────┘         │     │
│  │                                                      │     │
│  │  Features:                                          │     │
│  │  • Dark/Light Mode                                  │     │
│  │  • Responsive Design                                │     │
│  │  • Real-time Updates                                │     │
│  │  • Modal Dialogs                                    │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/HTTP
                            │ REST API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Node.js + Express Server               │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │           Middleware Layer                    │  │     │
│  │  │  • Authentication (JWT)                       │  │     │
│  │  │  • Authorization (Roles)                      │  │     │
│  │  │  • File Upload (Multer)                       │  │     │
│  │  │  • Validation (Express-Validator)             │  │     │
│  │  │  • Error Handling                             │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │              API Routes                       │  │     │
│  │  │  • /api/auth      - Authentication            │  │     │
│  │  │  • /api/assets    - Asset Management          │  │     │
│  │  │  • /api/inventory - Inventory Control         │  │     │
│  │  │  • /api/employees - Employee Management       │  │     │
│  │  │  • /api/clients   - Client Management         │  │     │
│  │  │  • /api/rentals   - Property Management       │  │     │
│  │  │  • /api/reports   - Analytics & Reports       │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │           Business Logic Layer                │  │     │
│  │  │  • Asset Depreciation                         │  │     │
│  │  │  • Stock Management                           │  │     │
│  │  │  • Employee Assignment                        │  │     │
│  │  │  • Contract Management                        │  │     │
│  │  │  • Payment Processing                         │  │     │
│  │  │  • Notification Generation                    │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │                SQLite3 Database                     │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │              Core Tables                      │  │     │
│  │  │  • users          - Authentication            │  │     │
│  │  │  • assets         - Asset Records             │  │     │
│  │  │  • inventory      - Stock Items               │  │     │
│  │  │  • employees      - Employee Data             │  │     │
│  │  │  • clients        - Client Records            │  │     │
│  │  │  • rental_properties - Property Data          │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │           Supporting Tables                   │  │     │
│  │  │  • asset_documents                            │  │     │
│  │  │  • asset_history                              │  │     │
│  │  │  • inventory_transactions                     │  │     │
│  │  │  • employee_documents                         │  │     │
│  │  │  • guarantors                                 │  │     │
│  │  │  • service_contracts                          │  │     │
│  │  │  • tenants                                    │  │     │
│  │  │  • rent_payments                              │  │     │
│  │  │  • invoices                                   │  │     │
│  │  │  • audit_logs                                 │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ File System
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │              File System Storage                    │     │
│  │  • /uploads/assets/     - Asset Documents          │     │
│  │  • /uploads/employees/  - Employee Documents       │     │
│  │  • /uploads/guarantors/ - Guarantor Documents      │     │
│  │  • /database/           - SQLite Database File     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User Login
    ↓
Frontend sends credentials
    ↓
Backend validates credentials
    ↓
Password verified with bcrypt
    ↓
JWT token generated
    ↓
Token sent to frontend
    ↓
Token stored in localStorage
    ↓
Token included in all API requests
```

### 2. Asset Management Flow
```
User adds asset
    ↓
Frontend validates input
    ↓
API request with JWT token
    ↓
Backend validates token & permissions
    ↓
Data validated
    ↓
Asset saved to database
    ↓
History log created
    ↓
Success response sent
    ↓
Frontend updates UI
```

### 3. Inventory Transaction Flow
```
User records stock transaction
    ↓
Frontend sends transaction data
    ↓
Backend validates permissions
    ↓
Current stock retrieved
    ↓
Stock calculation performed
    ↓
Transaction recorded
    ↓
Stock level updated
    ↓
Low stock check performed
    ↓
Notification generated (if needed)
    ↓
Response sent to frontend
```

### 4. Document Upload Flow
```
User selects file
    ↓
Frontend validates file type/size
    ↓
File sent via multipart/form-data
    ↓
Multer middleware processes upload
    ↓
File saved to disk
    ↓
File path stored in database
    ↓
Success response with file info
    ↓
Frontend displays confirmation
```

## Module Architecture

### Frontend Modules

```
public/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Complete styling with CSS variables
└── js/
    ├── app.js          # Core application logic
    │   • State management
    │   • Navigation
    │   • API communication
    │   • Theme management
    │
    ├── auth.js         # Authentication handling
    │   • Login/logout
    │   • Token management
    │   • Session handling
    │
    ├── dashboard.js    # Dashboard page
    │   • Statistics display
    │   • Quick actions
    │
    ├── assets.js       # Asset management UI
    │   • Asset CRUD operations
    │   • Document uploads
    │   • History display
    │
    ├── inventory.js    # Inventory management UI
    │   • Stock management
    │   • Transactions
    │   • Supplier management
    │
    ├── employees.js    # Employee management UI
    │   • Employee CRUD
    │   • Document management
    │   • Guarantor management
    │
    ├── clients.js      # Client management UI
    │   • Client CRUD
    │   • Contract management
    │   • Employee assignments
    │
    ├── rentals.js      # Rental management UI
    │   • Property management
    │   • Tenant management
    │   • Payment tracking
    │
    └── reports.js      # Reports and analytics
        • Dashboard stats
        • Various reports
        • Data visualization
```

### Backend Modules

```
server/
├── index.js            # Server entry point
│   • Express setup
│   • Middleware configuration
│   • Route mounting
│   • Error handling
│
├── initDb.js           # Database initialization
│   • Table creation
│   • Default data insertion
│   • Directory setup
│
├── config/
│   └── database.js     # Database connection
│       • SQLite setup
│       • Query helpers
│       • Connection management
│
├── middleware/
│   ├── auth.js         # Authentication middleware
│   │   • JWT verification
│   │   • Role authorization
│   │   • User context
│   │
│   └── upload.js       # File upload middleware
│       • Multer configuration
│       • File validation
│       • Storage setup
│
└── routes/
    ├── auth.js         # Authentication routes
    │   • Login
    │   • User info
    │   • Password change
    │
    ├── assets.js       # Asset management routes
    │   • CRUD operations
    │   • Document upload
    │   • History tracking
    │
    ├── inventory.js    # Inventory routes
    │   • Item management
    │   • Transactions
    │   • Supplier management
    │
    ├── employees.js    # Employee routes
    │   • Employee CRUD
    │   • Document management
    │   • Guarantor management
    │   • Attendance
    │
    ├── clients.js      # Client routes
    │   • Client CRUD
    │   • Contract management
    │   • Employee assignments
    │
    ├── rentals.js      # Rental routes
    │   • Property CRUD
    │   • Tenant management
    │   • Payment tracking
    │
    └── reports.js      # Reporting routes
        • Dashboard stats
        • Various reports
        • Notifications
```

## Database Schema

### Entity Relationship Overview

```
users (1) ──────────────────> (∞) audit_logs
  │
  └──> (∞) assets
  └──> (∞) inventory
  └──> (∞) employees

assets (1) ──> (∞) asset_documents
       (1) ──> (∞) asset_history
       (∞) <── (1) employees [assigned_to]

inventory (1) ──> (∞) inventory_transactions
          (∞) <── (∞) purchase_orders [via po_items]

employees (1) ──> (∞) employee_documents
          (1) ──> (∞) guarantors
          (1) ──> (∞) attendance
          (∞) <── (∞) clients [via employee_assignments]

guarantors (1) ──> (∞) guarantor_documents

clients (1) ──> (∞) service_contracts
        (1) ──> (∞) invoices
        (∞) <── (∞) employees [via employee_assignments]

rental_properties (1) ──> (∞) tenants

tenants (1) ──> (∞) rent_payments

suppliers (1) ──> (∞) purchase_orders

purchase_orders (1) ──> (∞) po_items
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates against database
3. Password verified with bcrypt
4. JWT token generated with user ID and role
5. Token sent to client
6. Client stores token in localStorage
7. Token included in Authorization header for all requests
8. Server validates token on each request
9. User context attached to request object
```

### Authorization Layers
```
1. Route Level
   • Middleware checks if user is authenticated
   • Validates JWT token

2. Role Level
   • Middleware checks user role
   • Compares against required roles
   • Grants or denies access

3. Resource Level
   • Business logic checks ownership
   • Validates user can access specific resource
```

## Performance Considerations

### Frontend Optimization
- Minimal dependencies (no heavy frameworks)
- CSS variables for theming
- Efficient DOM manipulation
- Lazy loading of data
- Client-side caching

### Backend Optimization
- Efficient SQL queries
- Indexed database columns
- Connection pooling
- Minimal middleware stack
- Optimized file uploads

### Database Optimization
- Proper indexing
- Foreign key constraints
- Efficient query design
- Transaction support
- Regular maintenance

## Scalability Path

### Current Architecture (Single Server)
```
[Client] ──> [Node.js Server] ──> [SQLite DB]
                                   [File System]
```

### Scaled Architecture (Future)
```
[Clients] ──> [Load Balancer] ──> [Node.js Servers (Multiple)]
                                        │
                                        ├──> [PostgreSQL/MySQL]
                                        ├──> [Redis Cache]
                                        └──> [S3/Cloud Storage]
```

## Technology Stack Details

### Backend
- **Runtime**: Node.js 14+
- **Framework**: Express.js 4.x
- **Database**: SQLite3 5.x
- **Authentication**: JWT (jsonwebtoken 9.x)
- **Password**: Bcrypt.js 2.x
- **File Upload**: Multer 1.x
- **Validation**: Express-Validator 7.x
- **Scheduling**: Node-cron 3.x

### Frontend
- **HTML**: HTML5
- **CSS**: CSS3 with Variables
- **JavaScript**: ES6+
- **Icons**: Font Awesome 6.x
- **No Framework**: Vanilla JavaScript

### Database
- **Type**: SQLite3
- **File**: Single .db file
- **Tables**: 20+
- **Relationships**: Foreign keys enabled
- **Transactions**: Supported

## Deployment Architecture

### Development
```
Local Machine
├── Node.js Server (Port 3000)
├── SQLite Database (./database/)
└── File Storage (./uploads/)
```

### Production (Recommended)
```
Server
├── Nginx (Reverse Proxy + SSL)
│   └──> Node.js (PM2 Process Manager)
│        ├── SQLite Database
│        └── File Storage
├── Firewall (UFW/Windows Firewall)
└── Backup System (Cron/Task Scheduler)
```

## Monitoring & Logging

### Application Logs
- Server startup/shutdown
- API requests
- Errors and exceptions
- Authentication attempts
- Database operations

### Audit Logs
- User actions
- Data modifications
- Login/logout events
- Permission changes
- Critical operations

### Performance Metrics
- Response times
- Database query times
- Memory usage
- CPU usage
- Disk space

---

This architecture provides a solid foundation that is:
- ✅ Easy to understand
- ✅ Simple to deploy
- ✅ Secure by design
- ✅ Scalable when needed
- ✅ Maintainable long-term

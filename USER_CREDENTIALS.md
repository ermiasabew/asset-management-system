# User Credentials and Access Guide

## 🔐 Default User Accounts

The system now includes **6 pre-configured user accounts** with different roles and privileges.

### All User Accounts

| # | Username | Password | Role | Full Name | Email |
|---|----------|----------|------|-----------|-------|
| 1 | **admin** | admin123 | Admin | System Administrator | admin@company.com |
| 2 | **assetmgr** | asset123 | Asset Manager | John Smith | assets@company.com |
| 3 | **invmgr** | inventory123 | Inventory Manager | Sarah Johnson | inventory@company.com |
| 4 | **hrmgr** | hr123 | HR Manager | Mike Davis | hr@company.com |
| 5 | **clientmgr** | client123 | Client Manager | Emily Brown | clients@company.com |
| 6 | **accountant** | account123 | Accountant | David Wilson | accounting@company.com |

---

## 👑 1. Admin Account

**Login:**
- Username: `admin`
- Password: `admin123`

**Full Access:**
- ✅ All modules (Assets, Inventory, Employees, Clients, Rentals)
- ✅ User management (create, edit, delete users)
- ✅ All reports and analytics
- ✅ System configuration
- ✅ Audit logs
- ✅ Can perform all operations

**Use this account for:**
- Initial system setup
- Creating/managing other users
- System administration
- Full access to all features

---

## 📦 2. Asset Manager Account

**Login:**
- Username: `assetmgr`
- Password: `asset123`

**Access:**
- ✅ Asset Management (full CRUD)
- ✅ Rental Properties (full CRUD)
- ✅ Upload asset documents
- ✅ View asset reports
- ✅ Manage tenants
- ✅ Record rent payments
- ❌ Cannot manage users
- ❌ Cannot manage employees
- ❌ Cannot manage inventory

**Use this account for:**
- Managing company assets
- Tracking asset locations and status
- Managing rental properties
- Tenant management

---

## 📊 3. Inventory Manager Account

**Login:**
- Username: `invmgr`
- Password: `inventory123`

**Access:**
- ✅ Inventory Management (full CRUD)
- ✅ Stock transactions (in/out)
- ✅ Supplier management
- ✅ Purchase orders
- ✅ View inventory reports
- ✅ Low stock alerts
- ❌ Cannot manage assets
- ❌ Cannot manage employees
- ❌ Cannot manage clients

**Use this account for:**
- Managing inventory items
- Recording stock movements
- Managing suppliers
- Creating purchase orders
- Monitoring stock levels

---

## 👥 4. HR Manager Account

**Login:**
- Username: `hrmgr`
- Password: `hr123`

**Access:**
- ✅ Employee Management (full CRUD)
- ✅ Upload employee documents
- ✅ Manage guarantors
- ✅ Record attendance
- ✅ View employee reports
- ✅ Manage employee status
- ❌ Cannot manage assets
- ❌ Cannot manage inventory
- ❌ Cannot manage clients directly

**Use this account for:**
- Hiring and managing employees
- Document management
- Guarantor verification
- Attendance tracking
- Employee records

---

## 🤝 5. Client Manager Account

**Login:**
- Username: `clientmgr`
- Password: `client123`

**Access:**
- ✅ Client Management (full CRUD)
- ✅ Service contracts
- ✅ Assign employees to clients
- ✅ View client reports
- ✅ Manage invoices
- ❌ Cannot manage assets
- ❌ Cannot manage inventory
- ❌ Cannot edit employee records (only assign)

**Use this account for:**
- Managing client relationships
- Creating service contracts
- Assigning staff to clients
- Client billing
- Contract renewals

---

## 💰 6. Accountant Account

**Login:**
- Username: `accountant`
- Password: `account123`

**Access:**
- ✅ View all reports
- ✅ View revenue reports
- ✅ Record rent payments
- ✅ View invoices
- ✅ View payment history
- ✅ Export reports
- ❌ Cannot add/edit/delete most records
- ❌ Read-only access to most data

**Use this account for:**
- Financial reporting
- Recording payments
- Viewing revenue data
- Generating financial reports
- Audit purposes

---

## 🔒 Security Notes

### ⚠️ IMPORTANT - Change Default Passwords!

**After first login, immediately change all default passwords:**

1. Login with each account
2. Click user menu (top right)
3. Select "Settings" or "Change Password"
4. Enter current password
5. Enter new strong password
6. Save changes

### Password Requirements

- Minimum 6 characters (recommended: 12+)
- Use mix of uppercase, lowercase, numbers, symbols
- Don't use common words or patterns
- Don't reuse passwords
- Change passwords every 90 days

---

## 🎯 Quick Test Guide

### Test Each Role:

1. **Test Admin:**
   ```
   Login: admin / admin123
   - Go to Users page (should be visible)
   - Try creating a new user
   - Access all modules
   ```

2. **Test Asset Manager:**
   ```
   Login: assetmgr / asset123
   - Go to Assets page
   - Try adding an asset
   - Go to Rentals page
   - Users page should NOT be visible
   ```

3. **Test Inventory Manager:**
   ```
   Login: invmgr / inventory123
   - Go to Inventory page
   - Try adding an item
   - Record a stock transaction
   - Assets page should be read-only or hidden
   ```

4. **Test HR Manager:**
   ```
   Login: hrmgr / hr123
   - Go to Employees page
   - Try adding an employee
   - Upload a document
   - Inventory page should be hidden
   ```

5. **Test Client Manager:**
   ```
   Login: clientmgr / client123
   - Go to Clients page
   - Try adding a client
   - Create a service contract
   - Assets page should be hidden
   ```

6. **Test Accountant:**
   ```
   Login: accountant / account123
   - Go to Reports page
   - View all reports
   - Try to edit something (should fail)
   - Most pages should be read-only
   ```

---

## 👥 User Management (Admin Only)

### Creating New Users

1. Login as **admin**
2. Click **Users** in sidebar
3. Click **Add User** button
4. Fill in details:
   - Username (unique)
   - Password (min 6 chars)
   - Full Name
   - Email
   - Role (select from dropdown)
5. Click **Create User**

### Editing Users

1. Go to Users page
2. Click **Edit** button on user row
3. Update details (username cannot be changed)
4. Click **Update User**

### Deleting Users

1. Go to Users page
2. Click **Delete** button on user row
3. Confirm deletion
4. Note: Cannot delete admin user or yourself

---

## 📋 Access Control Matrix

| Feature | Admin | Asset Mgr | Inv Mgr | HR Mgr | Client Mgr | Accountant |
|---------|-------|-----------|---------|--------|------------|------------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Assets** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | 👁️ View |
| **Inventory** | ✅ Full | ❌ | ✅ Full | ❌ | ❌ | 👁️ View |
| **Employees** | ✅ Full | ❌ | ❌ | ✅ Full | 👁️ View | 👁️ View |
| **Clients** | ✅ Full | ❌ | ❌ | ❌ | ✅ Full | 👁️ View |
| **Rentals** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | 👁️ View |
| **Reports** | ✅ Full | 👁️ View | 👁️ View | 👁️ View | 👁️ View | ✅ Full |
| **Users** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full = Create, Read, Update, Delete
- 👁️ View = Read Only
- ❌ = No Access

---

## 🚀 Getting Started

### First Time Setup:

1. **Initialize Database:**
   ```cmd
   npm run init-db
   ```
   This creates all 6 users automatically.

2. **Start Server:**
   ```cmd
   npm run dev
   ```

3. **Login as Admin:**
   - Open http://localhost:3000
   - Username: `admin`
   - Password: `admin123`

4. **Change Admin Password:**
   - Click user menu (top right)
   - Change password immediately

5. **Test Other Accounts:**
   - Logout
   - Login with each account
   - Verify access levels
   - Change all passwords

6. **Create Additional Users:**
   - Login as admin
   - Go to Users page
   - Add users as needed

---

## 📞 Support

### Common Issues:

**Q: Can't login with new credentials?**
- Make sure you ran `npm run init-db`
- Check if database was created
- Verify username/password (case-sensitive)

**Q: Users page not visible?**
- Only admin can see Users page
- Login with admin account

**Q: Getting "Access Denied" errors?**
- Check your user role
- Some features are role-restricted
- Login with appropriate account

**Q: Forgot password?**
- Admin can reset passwords in Users page
- Or manually update in database

---

## 🔄 Re-initializing Users

If you need to recreate all default users:

```cmd
# Delete database
del database\company.db

# Reinitialize
npm run init-db
```

**Warning:** This will delete ALL data!

---

## 📝 Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- Audit logs track all user actions
- Admin cannot delete their own account
- Username cannot be changed after creation
- Email addresses should be unique

---

**Status:** ✅ All 6 user accounts created and ready to use!

**Last Updated:** 2024-11-19

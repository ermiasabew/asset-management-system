# Backup & Restore Guide

## What Gets Backed Up?

When you click "Download Complete Backup" in Settings → System → Backup & Restore, the system creates a ZIP file containing:

### 1. **Database** (`database/company.db`)
All your data records including:
- Users and roles
- Employees and guarantors
- Assets and inventory
- Clients and rentals
- Reports and audit logs
- System settings

### 2. **Uploaded Files** (`uploads/` folder)
All uploaded documents and images:
- **Employee documents** (contracts, IDs, certificates)
- **Employee photos**
- **Guarantor documents** (IDs, proof of address, guarantee letters)
- **Asset images**
- **General documents**

### 3. **Backup Info** (`backup-info.json`)
Metadata about the backup:
- Timestamp
- Created by (username)
- Version
- What's included

## How to Create a Backup

1. **Login as Admin**
2. Go to **Settings** (sidebar)
3. Click on **System** tab
4. Scroll to **Backup & Restore** section
5. Click **"Download Complete Backup"**
6. A ZIP file will be downloaded (e.g., `backup-2024-11-30.zip`)

## Backup File Structure

```
backup-2024-11-30.zip
├── database/
│   └── company.db          # All data records
├── uploads/
│   ├── employees/          # Employee documents & photos
│   ├── guarantors/         # Guarantor documents
│   ├── assets/             # Asset images
│   └── general/            # Other documents
└── backup-info.json        # Backup metadata
```

## Best Practices

### Regular Backups
- **Daily**: If you have active operations
- **Weekly**: For moderate usage
- **Before major changes**: System updates, bulk imports, etc.

### Storage
- Store backups in **multiple locations**:
  - External hard drive
  - Cloud storage (Google Drive, Dropbox, OneDrive)
  - Network storage
- Keep at least **3 recent backups**
- Test restore occasionally

### Security
- Backup files contain **sensitive data**
- Store in **secure locations**
- Use **encryption** if storing in cloud
- Limit access to authorized personnel

## How to Restore (Manual Process)

Currently, restoration is a manual process:

### 1. Stop the Server
```bash
# Press Ctrl+C in the terminal running the server
```

### 2. Extract Backup
- Unzip the backup file
- You'll see `database/` and `uploads/` folders

### 3. Replace Files
```bash
# Backup current files first (just in case)
cp database/company.db database/company.db.backup
cp -r uploads uploads.backup

# Restore from backup
cp backup-2024-11-30/database/company.db database/
cp -r backup-2024-11-30/uploads/* uploads/
```

### 4. Restart Server
```bash
npm run server
```

## Automated Restore (Coming Soon)

A future update will include:
- One-click restore from backup ZIP
- Selective restore (database only or files only)
- Backup scheduling
- Automatic cloud backup

## Troubleshooting

### Backup Download Fails
- Check disk space
- Verify you're logged in as admin
- Check server logs for errors

### Large Backup Size
- Normal if you have many documents
- Consider archiving old data
- Clean up unused files

### Backup Takes Long Time
- Normal for large systems
- Don't close browser during backup
- Wait for completion message

## Support

For issues or questions:
- Check server logs
- Contact system administrator
- Review documentation

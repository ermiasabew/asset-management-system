# Document Management Guide

## 📄 Overview

The system includes comprehensive document management for employees, guarantors, and assets. You can upload, view, and manage various types of documents with expiry tracking and alerts.

---

## 👥 Employee Documents

### Supported Document Types

1. **ID Card / National ID** - Government-issued identification
2. **Passport** - International travel document
3. **Driver License** - Driving permit
4. **CV / Resume** - Curriculum vitae
5. **Educational Certificate** - Degrees, diplomas
6. **Professional Certificate** - Industry certifications
7. **Training Certificate** - Training completion certificates
8. **Medical Certificate** - Health clearance, fitness certificates
9. **Police Clearance** - Background check certificate
10. **Employment Contract** - Signed employment agreement
11. **Experience Letter** - Previous employment proof
12. **Reference Letter** - Professional references
13. **Other** - Any other relevant documents

### How to Upload Employee Documents

1. **Navigate to Employees:**
   - Login with admin or HR manager account
   - Click "Employees" in sidebar

2. **Select Employee:**
   - Click the eye icon (👁️) to view employee details

3. **Upload Document:**
   - Click "Upload Document" button
   - Select document type from dropdown
   - Choose expiry date (if applicable)
   - Select file from your computer
   - Click "Upload"

4. **Supported File Formats:**
   - PDF (.pdf)
   - Images (.jpg, .jpeg, .png)
   - Word Documents (.doc, .docx)
   - Maximum file size: 10MB

### Document Expiry Tracking

- Set expiry dates for documents that expire (ID cards, licenses, certificates)
- System will send alerts 30 days before expiry
- Expired documents are highlighted in notifications
- Leave expiry date empty for documents that don't expire (CV, experience letters)

### Viewing Documents

- All uploaded documents appear in the employee details view
- Shows document type, file name, and expiry date
- Documents are organized by employee

### Deleting Documents

- Click the trash icon (🗑️) next to any document
- Confirm deletion
- File is removed from both database and file system

---

## 🛡️ Guarantor Documents

### Supported Document Types

1. **ID Card / National ID** - Guarantor's identification
2. **Passport** - International ID
3. **Proof of Address** - Utility bill, rental agreement
4. **Employment Letter** - Proof of employment
5. **Bank Statement** - Financial proof
6. **Property Document** - Property ownership proof
7. **Guarantee Letter** - Signed guarantee agreement
8. **Other** - Any other relevant documents

### How to Upload Guarantor Documents

1. **Add Guarantor First:**
   - View employee details
   - Click "Add Guarantor"
   - Fill in guarantor information
   - Save

2. **Upload Guarantor Documents:**
   - In employee details, find the guarantor
   - Click "Upload Doc" button next to guarantor name
   - Select document type
   - Choose file
   - Click "Upload"

### Guarantor Verification

- Each guarantor has a verification status:
  - **Pending** - Awaiting verification
  - **Verified** - Documents verified and approved
  - **Rejected** - Verification failed

- Upload all required documents before verification
- HR manager can update verification status

---

## 📦 Asset Documents

### Supported Document Types

1. **Purchase Receipt** - Proof of purchase
2. **Invoice** - Purchase invoice
3. **Warranty Certificate** - Warranty documentation
4. **Insurance Policy** - Insurance documents
5. **Maintenance Records** - Service history
6. **User Manual** - Product manual
7. **Contract** - Rental or lease agreements
8. **Photos** - Asset images
9. **Other** - Any other relevant documents

### How to Upload Asset Documents

1. **Navigate to Assets:**
   - Click "Assets" in sidebar

2. **Select Asset:**
   - Click eye icon to view asset details

3. **Upload Document:**
   - Click "Upload Document" button
   - Select document type
   - Choose file
   - Click "Upload"

---

## 📊 Document Storage

### File Organization

```
uploads/
├── assets/          # Asset documents
│   ├── 1234567890-receipt.pdf
│   ├── 1234567891-warranty.pdf
│   └── ...
├── employees/       # Employee documents
│   ├── 1234567892-id.jpg
│   ├── 1234567893-cv.pdf
│   └── ...
└── guarantors/      # Guarantor documents
    ├── 1234567894-id.jpg
    ├── 1234567895-address.pdf
    └── ...
```

### File Naming

- Files are automatically renamed with timestamp
- Format: `{timestamp}-{random}-{original-extension}`
- Original filename is stored in database
- Prevents filename conflicts

### Security

- Files are stored outside web root
- Access requires authentication
- Only authorized users can view/download
- File type validation on upload
- File size limits enforced

---

## 🔔 Document Expiry Alerts

### Automatic Notifications

The system automatically checks for:

1. **Expiring Documents (30 days):**
   - Employee ID cards
   - Passports
   - Driver licenses
   - Medical certificates
   - Professional certificates
   - Any document with expiry date

2. **Expired Documents:**
   - Documents past expiry date
   - Highlighted in red
   - Urgent action required

### Viewing Alerts

- Click notification bell icon (🔔) in header
- View all document expiry alerts
- Alerts show:
  - Document type
  - Employee name
  - Expiry date
  - Days remaining

---

## 📋 Document Checklist

### New Employee Onboarding

Required documents to collect:

- [ ] ID Card / National ID (with expiry)
- [ ] Passport (if applicable)
- [ ] Driver License (if required for role)
- [ ] CV / Resume
- [ ] Educational Certificates
- [ ] Professional Certificates
- [ ] Medical Certificate (with expiry)
- [ ] Police Clearance
- [ ] Employment Contract (signed)
- [ ] Previous Experience Letters
- [ ] Reference Letters
- [ ] Guarantor Information
- [ ] Guarantor ID Card
- [ ] Guarantor Proof of Address

### Guarantor Verification

Required documents:

- [ ] Guarantor ID Card / National ID
- [ ] Proof of Address (utility bill, etc.)
- [ ] Employment Letter (if employed)
- [ ] Bank Statement (last 3 months)
- [ ] Property Document (if property owner)
- [ ] Signed Guarantee Letter

### Asset Documentation

Required documents:

- [ ] Purchase Receipt
- [ ] Invoice
- [ ] Warranty Certificate
- [ ] Insurance Policy
- [ ] User Manual
- [ ] Photos (multiple angles)

---

## 🔍 Document Search & Filter

### Finding Documents

1. **By Employee:**
   - Go to Employees page
   - Search for employee
   - View their documents

2. **By Document Type:**
   - Filter employees by category
   - Check document status

3. **By Expiry Date:**
   - Check notifications
   - View expiring documents

---

## 💾 Backup & Recovery

### Backing Up Documents

```cmd
# Windows
xcopy uploads uploads_backup /E /I /Y

# Or use the backup folder
copy uploads\* backups\documents\%date%\
```

### Restoring Documents

```cmd
# Windows
xcopy uploads_backup uploads /E /I /Y
```

### Best Practices

1. **Regular Backups:**
   - Daily backup of uploads folder
   - Store backups off-site
   - Test restore procedure

2. **Document Retention:**
   - Keep employee documents for 7 years after termination
   - Archive old documents
   - Follow legal requirements

3. **Security:**
   - Encrypt sensitive documents
   - Limit access to authorized users
   - Audit document access

---

## 📱 Mobile Access

### Uploading from Mobile

1. Open system on mobile browser
2. Navigate to employee/asset
3. Click upload button
4. Choose file from:
   - Camera (take photo)
   - Gallery (existing photo)
   - Files (documents)
5. Upload

### Supported Mobile Formats

- Photos from camera
- Scanned documents
- PDF files
- All standard formats

---

## ⚠️ Common Issues

### Upload Fails

**Problem:** File won't upload

**Solutions:**
- Check file size (max 10MB)
- Verify file format (PDF, JPG, PNG, DOC, DOCX)
- Check internet connection
- Try different browser
- Clear browser cache

### File Not Found

**Problem:** Document shows but won't open

**Solutions:**
- File may have been deleted from server
- Check uploads folder exists
- Verify file permissions
- Restore from backup

### Expiry Alerts Not Showing

**Problem:** No alerts for expiring documents

**Solutions:**
- Verify expiry date is set
- Check notification settings
- Refresh page
- Check date is in future

---

## 📊 Document Statistics

### View Document Status

1. **Dashboard:**
   - Shows total documents
   - Expiring documents count
   - Missing documents alert

2. **Reports:**
   - Document compliance report
   - Expiry tracking report
   - Employee document status

---

## 🎯 Best Practices

### Document Management

1. **Upload Immediately:**
   - Upload documents as soon as received
   - Don't delay document collection

2. **Verify Documents:**
   - Check document authenticity
   - Verify expiry dates
   - Ensure documents are clear and readable

3. **Regular Updates:**
   - Update expired documents promptly
   - Renew certificates before expiry
   - Keep contact information current

4. **Organize Properly:**
   - Use correct document types
   - Add expiry dates where applicable
   - Use descriptive filenames

5. **Security:**
   - Don't share documents publicly
   - Limit access to authorized users
   - Delete documents when no longer needed

---

## 📞 Support

### Need Help?

**Document Upload Issues:**
- Check file format and size
- Try different browser
- Contact system administrator

**Missing Documents:**
- Check with employee
- Request re-upload
- Check backup files

**Expiry Alerts:**
- Set expiry dates correctly
- Check notification settings
- Verify date format

---

## ✅ Quick Reference

### File Formats Accepted
- ✅ PDF (.pdf)
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ Word (.doc, .docx)
- ❌ Excel files (not supported)
- ❌ ZIP files (not supported)

### File Size Limits
- Maximum: 10MB per file
- Recommended: Under 5MB
- Compress large files before upload

### Document Types
- **Employee:** 13 types
- **Guarantor:** 8 types
- **Asset:** 9 types

### Access Levels
- **Admin:** Full access
- **HR Manager:** Employee & guarantor documents
- **Asset Manager:** Asset documents
- **Others:** View only (if permitted)

---

**Last Updated:** 2024-11-19

**Version:** 1.0.0

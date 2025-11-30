# Render.com Deployment Checklist

## Pre-Deployment

- [ ] Test the app locally (everything works?)
- [ ] Create a backup of your current database
- [ ] Note down any important data

## Git Setup

```bash
# Initialize Git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"
```

## GitHub Setup

- [ ] Create GitHub repository
- [ ] Push code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/asset-management-system.git
git branch -M main
git push -u origin main
```

## Render Setup

- [ ] Sign up/Login to Render.com
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure settings:
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Environment: Node
  
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `JWT_SECRET` = (Generate random)
  - [ ] `PORT` = `10000`

- [ ] Add Persistent Disk:
  - [ ] Name: `data`
  - [ ] Mount Path: `/opt/render/project/src/database`
  - [ ] Size: `1 GB`

- [ ] Click "Create Web Service"

## Post-Deployment

- [ ] Wait for deployment to complete (5-10 min)
- [ ] Check logs for errors
- [ ] Visit your app URL
- [ ] Login with default credentials (admin/admin123)
- [ ] **IMMEDIATELY change admin password**
- [ ] Create your personal admin account
- [ ] Test all features:
  - [ ] Dashboard loads
  - [ ] Can create employee
  - [ ] Can upload document
  - [ ] Can create asset
  - [ ] Can create client
  - [ ] Can create rental
  - [ ] Can view reports
  - [ ] Can manage users
  - [ ] Can access settings
  - [ ] Can download backup

## Security

- [ ] Change default admin password
- [ ] Create new admin user with your name
- [ ] Disable or delete default "admin" user
- [ ] Review user permissions
- [ ] Set up regular backup schedule

## Backup Strategy

- [ ] Download initial backup
- [ ] Store backup in safe location
- [ ] Set reminder for weekly backups
- [ ] Test restore process

## Share with Team

- [ ] Share app URL with team
- [ ] Create user accounts for team members
- [ ] Assign appropriate roles
- [ ] Train team on how to use the system

## Monitor

- [ ] Check app daily for first week
- [ ] Monitor Render dashboard for issues
- [ ] Review audit logs regularly
- [ ] Check disk space usage

## Your App URL

```
https://asset-management-system-XXXX.onrender.com
```

(Replace XXXX with your actual Render URL)

## Default Credentials

**⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN!**

- Username: `admin`
- Password: `admin123`

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com

---

**Deployment Date:** _________________

**Deployed By:** _________________

**App URL:** _________________

**Notes:**
_________________
_________________
_________________

# Deploy to Render.com

## Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Git Installed** - Git should be installed on your computer

## Step 1: Initialize Git Repository

Open your terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - Asset Management System"
```

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **"+"** icon → **"New repository"**
3. Name it: `asset-management-system`
4. Keep it **Private** (recommended for business apps)
5. **Don't** initialize with README (we already have files)
6. Click **"Create repository"**

## Step 3: Push to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/asset-management-system.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**
6. Wait for deployment (5-10 minutes)

### Option B: Manual Setup

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `asset-management-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for better performance)

5. **Add Environment Variables**:
   - Click **"Advanced"**
   - Add these variables:
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = (click "Generate" for a random secret)
     - `PORT` = `10000`

6. **Add Persistent Disk** (Important!):
   - Scroll to **"Disk"**
   - Click **"Add Disk"**
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/src/database`
   - **Size**: `1 GB` (free tier)

7. Click **"Create Web Service"**

## Step 5: Wait for Deployment

- First deployment takes 5-10 minutes
- Watch the logs for any errors
- When you see "Server running on...", it's ready!

## Step 6: Access Your App

Your app will be available at:
```
https://asset-management-system-XXXX.onrender.com
```

**Default Login:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

## Important Notes

### Database Persistence

- The persistent disk ensures your database survives restarts
- **Without the disk, you'll lose all data on restart!**
- Backups are still recommended (use the built-in backup feature)

### File Uploads

- Uploaded files (documents, photos) are stored on the persistent disk
- They will persist across deployments
- Maximum disk size on free tier: 1GB

### Free Tier Limitations

- App sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free (enough for one app)
- Upgrade to paid plan for:
  - No sleep
  - More disk space
  - Better performance

### Environment Variables

The app uses these environment variables:

- `NODE_ENV` - Set to `production` for Render
- `JWT_SECRET` - Secret key for authentication tokens
- `PORT` - Port number (Render sets this automatically)

### Updating Your App

When you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Render will automatically redeploy!

## Troubleshooting

### App Won't Start

Check the logs in Render dashboard:
1. Go to your service
2. Click **"Logs"**
3. Look for error messages

Common issues:
- Missing environment variables
- Database initialization failed
- Port binding issues

### Database Not Persisting

Make sure:
1. Persistent disk is added
2. Mount path is correct: `/opt/render/project/src/database`
3. Disk is attached to the service

### Uploads Not Working

Check:
1. Disk is mounted
2. `uploads/` folder is in the mount path
3. Permissions are correct

### App is Slow

Free tier apps sleep after inactivity:
- First request wakes it up (30-60 seconds)
- Consider upgrading to paid plan
- Or use a service like UptimeRobot to ping it

## Security Recommendations

### After Deployment:

1. **Change Admin Password**
   - Login as admin
   - Go to Settings → Profile
   - Change password immediately

2. **Create Your Admin User**
   - Go to Users
   - Create a new admin user with your name
   - Delete or disable the default "admin" user

3. **Set Up Regular Backups**
   - Go to Settings → System → Backup & Restore
   - Download backups regularly
   - Store them securely (Google Drive, Dropbox, etc.)

4. **Review User Permissions**
   - Only give admin access to trusted users
   - Use role-based access for others

5. **Monitor Audit Logs**
   - Check who's accessing the system
   - Review any suspicious activity

## Backup Strategy

### Automated Backups (Recommended)

Set up a scheduled task to download backups:
1. Use the backup API endpoint
2. Schedule with a service like GitHub Actions
3. Store in cloud storage

### Manual Backups

1. Login as admin
2. Go to Settings → System
3. Click "Download Complete Backup"
4. Store the ZIP file safely
5. Do this weekly or before major changes

## Scaling

As your business grows:

### Upgrade Options:

1. **Starter Plan** ($7/month)
   - No sleep
   - Better performance
   - More disk space

2. **Standard Plan** ($25/month)
   - Even better performance
   - More resources
   - Priority support

3. **Custom Database**
   - Use PostgreSQL instead of SQLite
   - Better for high traffic
   - More reliable

## Support

### Issues?

1. Check Render logs
2. Check browser console (F12)
3. Review this guide
4. Contact Render support

### Need Help?

- Render Docs: [render.com/docs](https://render.com/docs)
- Render Community: [community.render.com](https://community.render.com)

## Cost Estimate

### Free Tier:
- Web Service: Free (750 hours/month)
- Persistent Disk: Free (1GB)
- **Total: $0/month**

### Paid (Recommended for Production):
- Starter Plan: $7/month
- Disk (10GB): $1/month
- **Total: $8/month**

## Next Steps

After deployment:
1. ✅ Change admin password
2. ✅ Create your users
3. ✅ Add your employees
4. ✅ Upload documents
5. ✅ Set up regular backups
6. ✅ Train your team

**Your Asset Management System is now live! 🎉**

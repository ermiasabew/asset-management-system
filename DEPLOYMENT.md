# Deployment Guide

This guide covers deploying the Asset and Inventory Management System to production.

## Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` in `.env` to a strong random string (32+ characters)
- [ ] Change default admin password
- [ ] Review and update all default credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Review file upload restrictions

### Configuration
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure production database path
- [ ] Set appropriate `PORT`
- [ ] Configure upload directory with proper permissions
- [ ] Set up logging directory
- [ ] Configure backup directory

### Testing
- [ ] Run all tests from TEST_CHECKLIST.md
- [ ] Test on production-like environment
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Backup/restore tested

## Deployment Options

### Option 1: Windows Server

#### Requirements
- Windows Server 2016 or later
- Node.js 14+ installed
- IIS (optional, for reverse proxy)

#### Steps

1. **Prepare Server**
```cmd
# Install Node.js from https://nodejs.org/
# Verify installation
node --version
npm --version
```

2. **Copy Files**
```cmd
# Copy entire project to server
# Example: C:\inetpub\asset-management\
```

3. **Install Dependencies**
```cmd
cd C:\inetpub\asset-management
npm install --production
```

4. **Configure Environment**
```cmd
# Edit .env file
notepad .env

# Set production values:
NODE_ENV=production
PORT=3000
JWT_SECRET=your_very_long_random_secret_key_here
DB_PATH=./database/company.db
```

5. **Initialize Database**
```cmd
npm run init-db
```

6. **Install PM2 (Process Manager)**
```cmd
npm install -g pm2
pm2 start server/index.js --name asset-management
pm2 save
pm2 startup
```

7. **Configure Windows Firewall**
```cmd
netsh advfirewall firewall add rule name="Asset Management" dir=in action=allow protocol=TCP localport=3000
```

8. **Set Up IIS Reverse Proxy (Optional)**
- Install URL Rewrite and ARR modules
- Create new site in IIS
- Configure reverse proxy to localhost:3000
- Enable SSL certificate

### Option 2: Linux Server (Ubuntu/Debian)

#### Requirements
- Ubuntu 20.04+ or Debian 10+
- Node.js 14+
- Nginx (for reverse proxy)

#### Steps

1. **Update System**
```bash
sudo apt update
sudo apt upgrade -y
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Create Application User**
```bash
sudo useradd -m -s /bin/bash assetmgmt
sudo su - assetmgmt
```

4. **Copy and Setup Application**
```bash
cd /home/assetmgmt
# Upload files via SCP/SFTP
npm install --production
npm run init-db
```

5. **Install PM2**
```bash
sudo npm install -g pm2
pm2 start server/index.js --name asset-management
pm2 save
pm2 startup systemd
```

6. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/asset-management
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Configure SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

8. **Configure Firewall**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Option 3: Docker Deployment

#### Dockerfile
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run init-db

EXPOSE 3000

CMD ["node", "server/index.js"]
```

#### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./database:/app/database
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_secret_key
    restart: unless-stopped
```

#### Deploy
```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Installation
```bash
# Check if server is running
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check logs
pm2 logs asset-management
```

### 2. Configure Backups

#### Windows
Create backup script `backup.bat`:
```batch
@echo off
set BACKUP_DIR=C:\backups\asset-management
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%

mkdir %BACKUP_DIR%\%DATE%
copy database\company.db %BACKUP_DIR%\%DATE%\
xcopy /E /I uploads %BACKUP_DIR%\%DATE%\uploads
```

Schedule with Task Scheduler.

#### Linux
Create backup script `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR=/backups/asset-management
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR/$DATE
cp database/company.db $BACKUP_DIR/$DATE/
cp -r uploads $BACKUP_DIR/$DATE/

# Keep only last 30 days
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /home/assetmgmt/backup.sh
```

### 3. Configure Monitoring

#### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Health Check Endpoint
Add to `server/index.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### 4. Set Up Logging

Create logs directory:
```bash
mkdir logs
```

Update server to log to file:
```javascript
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' }
);
```

### 5. Configure Email Notifications (Optional)

Install nodemailer:
```bash
npm install nodemailer
```

Add email configuration to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Maintenance

### Regular Tasks

#### Daily
- Check server status
- Review error logs
- Monitor disk space

#### Weekly
- Review backup logs
- Check database size
- Update dependencies (if needed)

#### Monthly
- Security updates
- Performance review
- User access audit

### Update Procedure

1. **Backup Current Version**
```bash
pm2 stop asset-management
cp -r /path/to/app /path/to/app-backup
```

2. **Update Code**
```bash
git pull origin main
# or upload new files
```

3. **Update Dependencies**
```bash
npm install --production
```

4. **Run Migrations (if any)**
```bash
# Run any database updates
```

5. **Restart Application**
```bash
pm2 restart asset-management
```

6. **Verify**
```bash
pm2 logs asset-management
curl http://localhost:3000/health
```

## Troubleshooting

### Server Won't Start
```bash
# Check logs
pm2 logs asset-management

# Check port availability
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux

# Check permissions
ls -la database/
ls -la uploads/
```

### Database Errors
```bash
# Check database file
ls -lh database/company.db

# Check permissions
chmod 644 database/company.db  # Linux

# Restore from backup
cp /backups/latest/company.db database/
```

### High Memory Usage
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart asset-management

# Check for memory leaks
pm2 monit
```

### Slow Performance
- Check database size
- Review slow queries
- Optimize indexes
- Increase server resources
- Enable caching

## Security Hardening

### 1. Environment Variables
Never commit `.env` to version control:
```bash
echo ".env" >> .gitignore
```

### 2. File Permissions
```bash
# Linux
chmod 600 .env
chmod 644 database/company.db
chmod 755 uploads/
```

### 3. Rate Limiting
Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to server:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Helmet.js
Install helmet:
```bash
npm install helmet
```

Add to server:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 5. HTTPS Only
Force HTTPS in production:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Share database file via NFS
- Centralize uploads storage
- Use Redis for sessions

### Vertical Scaling
- Increase server RAM
- Add more CPU cores
- Use SSD storage
- Optimize database

### Database Migration
To migrate from SQLite to PostgreSQL/MySQL:
1. Export data from SQLite
2. Create new database schema
3. Import data
4. Update database configuration
5. Test thoroughly

## Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Review error messages
3. Check server resources
4. Verify configuration
5. Test connectivity

## Rollback Procedure

If deployment fails:
```bash
# Stop current version
pm2 stop asset-management

# Restore backup
rm -rf /path/to/app
cp -r /path/to/app-backup /path/to/app

# Restore database
cp /backups/latest/company.db database/

# Restart
pm2 start asset-management
```

---

**Remember**: Always test in a staging environment before deploying to production!

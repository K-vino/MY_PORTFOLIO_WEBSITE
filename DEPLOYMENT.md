# 🚀 Deployment Guide - Vino K Portfolio Website

This guide provides step-by-step instructions for deploying the full-stack portfolio website.

## 📋 Prerequisites

- Node.js (v16 or higher)
- Git account
- MongoDB Atlas account
- Gmail account (for email functionality)
- Netlify account (for frontend)
- Render/Heroku account (for backend)

## 🗂️ Project Structure

```
MY_PORTFOLIO_WEBSITE/
├── client/                 # Frontend (Deploy to Netlify)
├── server/                 # Backend (Deploy to Render/Heroku)
├── package.json           # Root package.json
└── README.md
```

## 🎯 Deployment Steps

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Configure Database**
   ```bash
   # Create a new database called 'vino_portfolio'
   # Create collections: 'projects' and 'contacts'
   ```

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Seed Database (Optional)**
   ```bash
   cd server
   npm install
   # Set MONGODB_URI in .env file
   node seedData.js
   ```

### 2. Backend Deployment (Render)

1. **Prepare Backend**
   ```bash
   cd server
   npm install
   ```

2. **Create .env file**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   JWT_SECRET=your_super_secret_jwt_key
   SESSION_SECRET=your_super_secret_session_key
   ALLOWED_ORIGINS=https://vinok.netlify.app,https://vino-k-portfolio.netlify.app
   ```

3. **Deploy to Render**
   - Go to [Render](https://render.com)
   - Connect your GitHub repository
   - Create a new Web Service
   - Configure settings:
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
     - **Environment**: Node
     - **Region**: Choose closest to your users

4. **Set Environment Variables**
   - In Render dashboard, go to Environment
   - Add all variables from your .env file
   - **Important**: Don't include the .env file in your repository

5. **Custom Domain (Optional)**
   - In Render dashboard, go to Settings
   - Add custom domain: `api.vinok.dev`

### 3. Frontend Deployment (Netlify)

1. **Prepare Frontend**
   ```bash
   cd client
   # Update API_BASE_URL in js/main.js to your Render URL
   ```

2. **Deploy to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository
   - Configure build settings:
     - **Base directory**: `client`
     - **Build command**: `echo "Building frontend"`
     - **Publish directory**: `client`

3. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   API_URL=https://your-backend-url.onrender.com
   CONTACT_FORM_ENDPOINT=https://your-backend-url.onrender.com/api/contact
   PROJECTS_API_ENDPOINT=https://your-backend-url.onrender.com/api/projects
   ```

4. **Custom Domain**
   - In Netlify dashboard, go to Domain settings
   - Add custom domain: `vinok.dev` or `vinok.netlify.app`
   - Configure DNS settings

5. **SSL Certificate**
   - Netlify automatically provides SSL certificates
   - Ensure HTTPS is enabled

### 4. Alternative: Heroku Deployment

If you prefer Heroku for backend:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd server
   heroku create vino-k-portfolio-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set EMAIL_USER=your_email
   heroku config:set EMAIL_PASS=your_app_password
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## 🔧 Configuration Files

### Netlify Configuration (`client/netlify.toml`)
```toml
[build]
  publish = "."
  command = "echo 'Building Vino K Portfolio...'"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/api/:splat"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Render Configuration
Create `render.yaml` in root:
```yaml
services:
  - type: web
    name: vino-k-portfolio-api
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

## 📧 Email Configuration

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

## 🔒 Security Checklist

- [ ] Environment variables are set correctly
- [ ] Database connection string is secure
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] HTTPS is enforced
- [ ] Security headers are set

## 🧪 Testing Deployment

### Backend Testing
```bash
# Test API endpoints
curl https://your-backend-url.onrender.com/health
curl https://your-backend-url.onrender.com/api/projects
```

### Frontend Testing
```bash
# Test website
curl https://vinok.netlify.app
# Check if API calls work
# Test contact form submission
# Verify all sections load correctly
```

## 📊 Monitoring & Analytics

1. **Setup Google Analytics**
   - Create GA4 property
   - Add tracking code to HTML
   - Configure goals and events

2. **Monitor Performance**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals
   - Set up uptime monitoring

3. **Error Tracking**
   - Consider adding Sentry for error tracking
   - Monitor server logs in Render/Heroku

## 🔄 CI/CD Pipeline

### Automatic Deployment
1. **Netlify**: Automatically deploys on push to main branch
2. **Render**: Automatically deploys on push to main branch

### Manual Deployment
```bash
# Frontend
cd client
# Make changes
git add .
git commit -m "Update frontend"
git push origin main

# Backend
cd server
# Make changes
git add .
git commit -m "Update backend"
git push origin main
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check ALLOWED_ORIGINS in backend
   - Verify frontend is making requests to correct API URL

2. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled
   - Test email configuration locally first

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Check build logs for specific errors

### Debug Commands
```bash
# Check backend logs
heroku logs --tail -a your-app-name
# Or in Render dashboard

# Test API locally
cd server
npm run dev

# Test frontend locally
cd client
live-server --port=3000
```

## 📈 Performance Optimization

1. **Enable Compression** (already configured)
2. **Optimize Images** (WebP format, lazy loading)
3. **Minify CSS/JS** (configured in Netlify)
4. **Use CDN** (Netlify provides global CDN)
5. **Cache Static Assets** (Service Worker configured)

## 🔗 Useful Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📞 Support

If you encounter any issues during deployment:

1. Check the troubleshooting section above
2. Review the logs in your deployment platform
3. Test components individually (database, backend, frontend)
4. Verify all environment variables are set correctly

---

**Happy Deploying! 🚀**

Your portfolio website will be live at:
- **Frontend**: https://vinok.netlify.app
- **Backend API**: https://your-backend-url.onrender.com

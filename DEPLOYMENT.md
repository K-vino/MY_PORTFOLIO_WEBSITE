# Deployment Guide

## Quick Setup

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
# Required
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# Optional but recommended
OPENAI_API_KEY=sk-your-openai-api-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECEIVE_EMAIL=your-email@gmail.com
JWT_SECRET=your-secure-jwt-secret
```

### 2. Database Setup (MongoDB Atlas)

1. Create a free MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace `<username>`, `<password>`, and `<cluster>` in the MONGODB_URI

### 3. Install Dependencies & Seed Data

```bash
npm install
npm run seed
```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Deployment Options

### Option 1: Render (Recommended)

1. **Connect GitHub Repository**
   - Go to https://render.com
   - Connect your GitHub account
   - Select this repository

2. **Configure Web Service**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

3. **Add Environment Variables**
   - Add all variables from your `.env` file
   - Make sure to set `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on every push to main branch

### Option 2: Railway

1. **Connect Repository**
   - Go to https://railway.app
   - Click "Deploy from GitHub repo"
   - Select this repository

2. **Configure Environment**
   - Railway auto-detects Node.js
   - Add environment variables in the Variables tab

3. **Deploy**
   - Railway automatically deploys

### Option 3: Vercel (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Add variables in Vercel dashboard
   - Or use `vercel env add`

## Production Checklist

### Before Deployment

- [ ] Update `MONGODB_URI` with production database
- [ ] Add `OPENAI_API_KEY` for AI chat functionality
- [ ] Configure email settings for contact form
- [ ] Update domain in CORS settings (server.js)
- [ ] Test all functionality locally

### After Deployment

- [ ] Test all pages load correctly
- [ ] Test contact form submission
- [ ] Test AI chat functionality
- [ ] Verify database connections
- [ ] Check email notifications
- [ ] Test mobile responsiveness
- [ ] Verify SEO meta tags

## Domain Configuration

### Custom Domain Setup

1. **Purchase Domain** (optional)
   - Namecheap, GoDaddy, or Google Domains

2. **Configure DNS**
   - Add CNAME record pointing to your deployment URL
   - Or use A record with deployment IP

3. **Update Environment**
   - Update CORS origins in server.js
   - Update sitemap.xml with new domain
   - Update Open Graph URLs

### SSL Certificate

Most platforms (Render, Railway, Vercel) provide automatic SSL certificates.

## Monitoring & Maintenance

### Performance Monitoring

- Use platform-specific monitoring tools
- Monitor database performance in MongoDB Atlas
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Regular Updates

- Keep dependencies updated: `npm audit fix`
- Monitor for security vulnerabilities
- Update content and projects regularly
- Backup database periodically

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MONGODB_URI format
   - Verify database user permissions
   - Check IP whitelist in MongoDB Atlas

2. **AI Chat Not Working**
   - Verify OPENAI_API_KEY is set
   - Check API key permissions
   - Monitor rate limits

3. **Email Not Sending**
   - Verify EMAIL_USER and EMAIL_PASS
   - Use App Password for Gmail
   - Check spam folder

4. **Static Files Not Loading**
   - Verify file paths in HTML
   - Check server static file configuration
   - Clear browser cache

### Logs

Check platform-specific logs:
- **Render**: View logs in dashboard
- **Railway**: Use `railway logs`
- **Vercel**: Check Functions tab

## Security Notes

- Never commit `.env` file to repository
- Use strong JWT secrets
- Enable rate limiting in production
- Keep dependencies updated
- Use HTTPS only
- Validate all user inputs

## Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Implement caching headers
- Monitor database query performance
- Use connection pooling for MongoDB

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check GitHub issues for similar problems
4. Contact platform support if needed

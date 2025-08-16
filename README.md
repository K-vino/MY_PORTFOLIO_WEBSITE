# Vino K - Portfolio Website

A modern, full-stack portfolio website showcasing AI/ML development, data science, and cloud engineering expertise.

## 🚀 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- AOS.js for animations
- Responsive design (Mobile-first)
- Light/Dark mode toggle

### Backend
- Node.js + Express.js
- MongoDB Atlas (Cloud Database)
- REST API endpoints
- Secure form handling

### Deployment
- Frontend: Netlify
- Backend: Render/Heroku
- Database: MongoDB Atlas

## 📁 Project Structure

```
MY_PORTFOLIO_WEBSITE/
├── client/                 # Frontend application
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   ├── style.css      # Main styles
│   │   └── responsive.css # Mobile responsiveness
│   ├── js/
│   │   ├── main.js        # Main JavaScript
│   │   ├── theme.js       # Dark/Light mode
│   │   └── animations.js  # Animation controls
│   ├── assets/
│   │   ├── images/        # Profile images, project screenshots
│   │   ├── icons/         # SVG icons
│   │   └── resume/        # Resume PDF
│   └── netlify.toml       # Netlify deployment config
├── server/                # Backend application
│   ├── app.js            # Express server
│   ├── routes/
│   │   ├── projects.js   # Projects API routes
│   │   └── contact.js    # Contact form routes
│   ├── models/
│   │   ├── Project.js    # Project schema
│   │   └── Contact.js    # Contact schema
│   ├── middleware/
│   │   └── validation.js # Input validation
│   ├── config/
│   │   └── database.js   # MongoDB connection
│   └── package.json      # Backend dependencies
├── package.json          # Root package.json
└── README.md            # Project documentation
```

## 🛠️ Quick Setup

### Automated Setup
```bash
# Clone the repository
git clone https://github.com/K-vino/portfolio-website.git
cd MY_PORTFOLIO_WEBSITE

# Run automated setup
npm run setup

# Start development servers
npm run dev
```

### Manual Setup

#### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Gmail account (for contact form)
- Git

#### Installation Steps
1. **Clone and Install**
   ```bash
   git clone https://github.com/K-vino/portfolio-website.git
   cd MY_PORTFOLIO_WEBSITE
   npm run install-all
   ```

2. **Environment Configuration**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Database Setup**
   ```bash
   # Seed database with sample projects
   npm run seed
   ```

4. **Start Development**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run server  # Backend on http://localhost:5000
   npm run client  # Frontend on http://localhost:3000
   ```

### Environment Variables
Create `server/.env` with these values:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vino_portfolio

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Security
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_SECRET=your_super_secret_session_key_here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional
NODE_ENV=development
PORT=5000
DEBUG=true
```

## 🚀 Deployment

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `client`

### Backend (Render/Heroku)
1. Create new web service
2. Connect GitHub repository
3. Set environment variables
4. Deploy from `server` directory

## 📱 Features

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Dark/Light mode toggle
- ✅ Smooth animations and transitions
- ✅ Dynamic project loading from database
- ✅ Contact form with email notifications
- ✅ SEO optimized
- ✅ Fast loading performance

## 👨‍💻 Developer

**Vino K**  
AIML Developer | Data Scientist | Cloud Engineer | Django Developer  
📧 vk5571859@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/vino-k) | [GitHub](https://github.com/K-vino) | [Portfolio](https://vinok.netlify.app)

# Vino K - Portfolio Website

A modern, full-stack portfolio website showcasing AI/ML and Data Engineering projects, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Features

- **Responsive Design**: Mobile-first, accessible interface
- **Project Showcase**: Dynamic project gallery with filtering
- **AI Chat Assistant**: Interactive AI bot for visitor engagement
- **Contact System**: Form submissions with email notifications
- **Admin Panel**: Content management for projects and achievements
- **SEO Optimized**: Meta tags, sitemap, and structured data
- **Performance**: Fast loading with optimized assets

## 🛠 Tech Stack

**Frontend:**
- HTML5, CSS3 (Custom responsive design)
- Vanilla JavaScript (ES6+)
- Progressive enhancement

**Backend:**
- Node.js + Express
- MongoDB with Mongoose ODM
- RESTful API design

**AI Integration:**
- OpenAI API for chat functionality
- Rate limiting and safety measures

## 📁 Project Structure

```
portfolio/
├── client/                 # Frontend assets
│   ├── public/            # Static files (images, favicon, etc.)
│   ├── styles/            # CSS files
│   ├── scripts/           # JavaScript files
│   └── views/             # HTML templates
├── server/                # Backend application
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── controllers/       # Business logic
│   ├── middleware/        # Custom middleware
│   └── services/          # External service integrations
├── scripts/               # Utility scripts (seed data, etc.)
└── .github/workflows/     # CI/CD pipelines
```

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd portfolio
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (local or use MongoDB Atlas)

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Visit** `http://localhost:3000`

## 📊 API Endpoints

- `GET /api/projects` - List all projects (with filtering)
- `GET /api/projects/:slug` - Get project details
- `POST /api/contact` - Submit contact form
- `POST /api/chat` - AI chat interaction

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables.

### Database Setup

1. Create a MongoDB Atlas account or set up local MongoDB
2. Update `MONGODB_URI` in your `.env` file
3. Run the seed script to populate initial data

### AI Chat Setup

1. Get an OpenAI API key from https://platform.openai.com/
2. Add it to your `.env` file as `OPENAI_API_KEY`

## 📝 Content Management

The seed script populates the database with sample projects. To add your own:

1. Use the admin panel (coming soon)
2. Directly edit the seed script in `scripts/seed.js`
3. Use the API endpoints to programmatically add content

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Render
- Railway
- Vercel (with serverless functions)
- Heroku

See the deployment guide in the docs for platform-specific instructions.

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Vino K**
- Email: vk5571850@gmail.com
- LinkedIn: [linkedin.com/in/vino-k](https://linkedin.com/in/vino-k)
- GitHub: [github.com/K-vino](https://github.com/K-vino)

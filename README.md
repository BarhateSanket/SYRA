# SYRA AI - Enterprise Voice Assistant

<div align="center">

![SYRA AI Logo](https://img.shields.io/badge/SYRA-AI-8B5CF6?style=for-the-badge&logo=robot&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

**Experience the future of AI-powered voice assistance with SYRA - Your intelligent, customizable companion.**

[🌐 Live Demo](https://syra-ai.vercel.app) • [📖 Documentation](#-documentation) • [🎯 Features](#-features)

</div>

---

## 📋 Table of Contents

- [🎯 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📡 API Reference](#-api-reference)
- [🎨 UI/UX Design](#-uiux-design)
- [🔐 Security](#-security)
- [📱 Mobile Support](#-mobile-support)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Contact](#-contact)

---

## 🎯 Features

### 🤖 **AI-Powered Voice Assistant**
- **Natural Language Processing**: Advanced speech recognition with Hindi language support
- **Intelligent Command Classification**: Automatic categorization of user intents
- **Real-time Voice Interaction**: Continuous listening with instant response
- **Multi-language Support**: English and Hindi voice commands

### ⚡ **Lightning Fast Performance**
- **Instant Actions**: Frontend keyword detection for immediate responses
- **Optimized API Calls**: Smart caching and background processing
- **Progressive Web App**: Offline capabilities and fast loading
- **Edge Computing Ready**: Low-latency response times

### 🎨 **Premium User Experience**
- **Billion-Dollar Design**: Glassmorphism UI with animated gradients
- **Responsive Design**: Perfect experience on all devices
- **Dark Theme**: Eye-friendly interface with customizable themes
- **Accessibility**: WCAG compliant with screen reader support

### 🔧 **Advanced Customization**
- **Personal Assistant**: Customizable AI personality and appearance
- **Voice Preferences**: Adjustable speech rate, pitch, and language
- **Theme Customization**: Multiple color schemes and layouts
- **Profile Management**: User preferences and settings

### 🌐 **Smart Integrations**
- **Google Services**: Gmail, Calendar, Drive, Photos, Docs, Sheets, Slides
- **Social Media**: YouTube, Instagram, Facebook, Twitter, LinkedIn
- **Productivity Tools**: GitHub, WhatsApp Web, Spotify, Netflix
- **Web Services**: Google Search, Maps, News, Translate

### 📊 **Analytics & History**
- **Conversation History**: Complete chat logs with search functionality
- **Usage Analytics**: Command frequency and performance metrics
- **Export Features**: Data export in multiple formats
- **Privacy Controls**: User data management and deletion

### 🔒 **Enterprise Security**
- **JWT Authentication**: Secure token-based authentication
- **Data Encryption**: End-to-end encryption for sensitive data
- **Cloudinary Integration**: Secure image storage and processing
- **Rate Limiting**: Protection against abuse and spam

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express Backend │    │   MongoDB Atlas │
│   (Vite)        │◄──►│   (Node.js)     │◄──►│   Database       │
│                 │    │                 │    │                 │
│ • Voice UI      │    │ • REST API      │    │ • User Data     │
│ • Speech Recog. │    │ • JWT Auth      │    │ • Chat History  │
│ • Real-time     │    │ • Gemini AI     │    │ • Settings      │
│ • PWA           │    │ • Cloudinary    │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Gemini AI API │
                    │   (Google AI)   │
                    └─────────────────┘
```

### **Frontend Architecture**
- **Component-Based**: Modular React components with hooks
- **State Management**: Context API for global state
- **Routing**: React Router DOM for SPA navigation
- **Styling**: Tailwind CSS with custom animations

### **Backend Architecture**
- **RESTful API**: Clean API design with proper HTTP methods
- **Middleware**: Authentication, validation, and error handling
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer with Cloudinary integration

---

## 🛠️ Tech Stack

### **Frontend**
```json
{
  "framework": "React 19.1.1",
  "build": "Vite 7.1.12",
  "styling": "Tailwind CSS 4.1.13",
  "routing": "React Router DOM 7.9.2",
  "icons": "React Icons 5.5.0",
  "speech": "Web Speech API",
  "ui": "Custom Components"
}
```

### **Backend**
```json
{
  "runtime": "Node.js 18.x",
  "framework": "Express.js 5.1.0",
  "database": "MongoDB Atlas",
  "auth": "JWT (jsonwebtoken 9.0.2)",
  "file-upload": "Multer + Cloudinary",
  "ai": "Google Gemini AI",
  "validation": "Custom middleware"
}
```

### **DevOps & Tools**
```json
{
  "version-control": "Git",
  "deployment": "Vercel/Netlify",
  "monitoring": "Custom logging",
  "testing": "Jest + React Testing Library",
  "linting": "ESLint",
  "formatting": "Prettier"
}
```

---

## 📁 Project Structure

```
SYRA-AI/
├── 📁 assets/                    # Static assets
│   ├── logo1.png                 # Application logo
│   ├── ai.gif                    # AI animation
│   ├── user.gif                  # User avatar
│   ├── authBg.png               # Auth background
│   └── [image1-7].*             # Assistant avatars
│
├── 📁 backend/                   # Express.js API Server
│   ├── 📄 index.js              # Server entry point
│   ├── 📄 gemini.js             # AI integration
│   ├── 📄 package.json          # Backend dependencies
│   ├── 📁 config/               # Configuration files
│   │   ├── cloudinary.js        # Image upload config
│   │   ├── db.js               # Database connection
│   │   └── token.js            # JWT configuration
│   ├── 📁 controllers/          # Business logic
│   │   ├── auth.controller.js   # Authentication
│   │   └── user.controller.js   # User management
│   ├── 📁 middlewares/          # Custom middleware
│   │   ├── isAuth.js           # Authentication check
│   │   └── multer.js           # File upload handling
│   ├── 📁 models/              # Database models
│   │   └── user.model.js       # User schema
│   └── 📁 routes/              # API routes
│       ├── auth.routes.js      # Auth endpoints
│       └── user.routes.js      # User endpoints
│
└── 📁 frontend/                 # React Application
    ├── 📄 index.html           # HTML template
    ├── 📄 package.json         # Frontend dependencies
    ├── 📄 vite.config.js       # Build configuration
    ├── 📁 public/             # Static files
    ├── 📁 src/                # Source code
    │   ├── 📄 main.jsx        # App entry point
    │   ├── 📄 App.jsx         # Main component
    │   ├── 📄 index.css       # Global styles
    │   ├── 📁 components/     # Reusable components
    │   │   ├── Header.jsx     # Navigation header
    │   │   ├── Footer.jsx     # Site footer
    │   │   ├── Toast.jsx      # Notification toast
    │   │   ├── ProgressBar.jsx # Loading indicator
    │   │   ├── SkeletonLoader.jsx # Loading skeleton
    │   │   └── card.jsx       # Image selection card
    │   ├── 📁 pages/          # Page components
    │   │   ├── Home.jsx       # Main dashboard
    │   │   ├── Signin.jsx     # Login page
    │   │   ├── Signup.jsx     # Registration page
    │   │   ├── customize.jsx  # Image selection
    │   │   ├── customize2.jsx # Name input
    │   │   ├── History.jsx    # Chat history
    │   │   ├── Premium.jsx    # Premium features
    │   │   ├── Legal.jsx      # Legal pages
    │   │   ├── Contact.jsx    # Contact form
    │   │   ├── PaymentMethod.jsx # Payment methods
    │   │   └── AddPaymentMethod.jsx # Add payment method
    │   └── 📁 ContextApi/     # Global state
    │       └── UserContext.jsx # User context provider
    └── 📄 README.md           # Frontend docs
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB)
- Google Gemini AI API key
- Cloudinary account (optional, for image uploads)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/your-username/syra-ai.git
cd syra-ai
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://:5174
- Backend API: http://:5000

---

## 🔧 Configuration

### **Environment Variables**

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/syra_ai

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AI Integration
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### **Frontend Configuration**

Update `frontend/src/ContextApi/UserContext.jsx`:

```javascript
const serverUrl = "http://localhost:5000"; // Change for production
```

---

## 📡 API Reference

### **Authentication Endpoints**

#### **POST** `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### **POST** `/api/auth/signin`
Authenticate user login.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### **GET** `/api/auth/logout`
Clear authentication cookie.

### **User Management Endpoints**

#### **GET** `/api/user/current`
Get current authenticated user.

**Response:**
```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "assistantName": "Alex",
  "assistantImage": "https://...",
  "history": ["command1", "command2"]
}
```

#### **POST** `/api/user/update`
Update assistant settings.

**Form Data:**
- `assistantName`: string
- `assistantImage`: file (optional)
- `imageUrl`: string (alternative to file)

#### **POST** `/api/user/asktoassistant`
Send command to AI assistant.

**Request Body:**
```json
{
  "command": "open youtube and search for coding tutorials"
}
```

**Response:**
```json
{
  "type": "youtube-search",
  "userInput": "coding tutorials",
  "response": "Opening YouTube with coding tutorials"
}
```

---

## 🎨 UI/UX Design

### **Design Philosophy**
- **Minimalist**: Clean, uncluttered interface
- **Intuitive**: Natural user interactions
- **Accessible**: WCAG 2.1 AA compliant
- **Performant**: Optimized for speed and responsiveness

### **Color Palette**
```css
/* Primary Colors */
--primary-purple: #8B5CF6;
--primary-blue: #3B82F6;
--primary-pink: #EC4899;

/* Neutral Colors */
--slate-900: #0F172A;
--slate-800: #1E293B;
--slate-700: #334155;

/* Accent Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

### **Typography**
- **Primary Font**: Inter (sans-serif)
- **Headings**: 600-700 weight
- **Body Text**: 400 weight
- **Accent Text**: Gradient overlays

### **Animations**
- **Micro-interactions**: Hover effects, button presses
- **Loading States**: Skeleton loaders, progress bars
- **Page Transitions**: Smooth route changes
- **Voice Feedback**: Visual speech synthesis indicators

---

## 🔐 Security

### **Authentication & Authorization**
- **JWT Tokens**: Secure, stateless authentication
- **HTTP-Only Cookies**: XSS protection
- **Password Hashing**: bcrypt encryption
- **Rate Limiting**: API abuse prevention

### **Data Protection**
- **Encryption**: AES-256 for sensitive data
- **Input Validation**: Sanitization and validation
- **CORS**: Configured for secure cross-origin requests
- **HTTPS**: SSL/TLS encryption in production

### **Privacy Features**
- **Data Minimization**: Only collect necessary data
- **User Consent**: Clear privacy policy and terms
- **Data Deletion**: User-initiated data removal
- **Audit Logs**: Security event monitoring

---

## 📱 Mobile Support

### **Responsive Design**
- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Touch-Friendly**: Large touch targets and gestures
- **Adaptive Layout**: Fluid grids and flexible components
- **Performance**: Optimized for mobile networks

### **Mobile Navigation**
- **Integrated Header**: Voice Settings and Menu buttons integrated into header bar
- **Hamburger Menu**: Collapsible navigation menu for mobile devices
- **Responsive Layout**: Seamless transition between desktop and mobile views
- **Touch-Optimized**: Easy navigation on touch devices

### **PWA Features**
- **Offline Support**: Service worker caching
- **Installable**: Add to home screen
- **Push Notifications**: Background updates
- **Native Feel**: App-like experience

### **Voice Integration**
- **Mobile Speech**: Optimized for mobile microphones
- **Background Audio**: Continuous listening support
- **Battery Optimized**: Efficient voice processing
- **Network Aware**: Adaptive quality based on connection

---

## 🧪 Testing

### **Testing Strategy**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# E2E testing
npm run test:e2e

# Performance testing
npm run lighthouse
```

### **Test Coverage**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Lighthouse and Web Vitals

---

## 🚢 Deployment

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

### **Backend Deployment**
```bash
# Environment setup
heroku create syra-ai-backend
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Database migration (if needed)
heroku run npm run migrate
```

### **Production Checklist**
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring tools configured
- [ ] CDN setup for static assets
- [ ] Error tracking implemented

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- **ESLint**: JavaScript/React linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

### **Branch Naming**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**SYRA AI Team**

- **Project Lead**: Sanket Barhate
- **Email**: sanket@example.com
- **GitHub**: [@sanketbarhate](https://github.com/sanketbarhate)
- **LinkedIn**: [Sanket Barhate](https://linkedin.com/in/sanketbarhate)

### **Support**
- 📧 **Email**: support@syra.ai
- 💬 **Discord**: [Join our community](https://discord.gg/syra-ai)
- 📖 **Documentation**: [docs.syra.ai](https://docs.syra.ai)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/sanketbarhate/syra-ai/issues)

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent assistant
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for the utility-first styling approach
- **MongoDB Atlas** for reliable database hosting
- **Cloudinary** for seamless media management

---

<div align="center">

**Made with ❤️ for the future of AI-powered assistance**

⭐ **Star this repo if you found it helpful!**

[⬆️ Back to Top](#-syra-ai---enterprise-voice-assistant)

</div>

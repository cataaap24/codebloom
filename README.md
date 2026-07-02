# 🌸 CodeBloom - Programming Course Organizer

A minimalist and girly web app to organize programming courses, featuring a dashboard, task list, weekly calendar, notes/snippets, statistics, and a digital garden where completed courses grow flowers.

**Built with**: React, TypeScript, Tailwind CSS, tRPC, Express, MySQL, Drizzle ORM

---

## ✨ Features

- 📚 **Course Management** - Organize and track your programming courses
- 📅 **Weekly Calendar** - Schedule your learning sessions
- ✅ **Task List** - Keep track of course assignments
- 📝 **Notes & Snippets** - Save code snippets and learning notes with pastel backgrounds
- 📊 **Statistics** - Visual progress tracking
- 🌸 **Digital Garden** - Beautiful flowers bloom for each completed course
- 🎨 **Girly Design** - Minimalist, pastel aesthetic

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **pnpm** (or npm/yarn)
- **MySQL** 8.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/cataaap24/codebloom.git
cd codebloom

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and JWT secret

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 🌐 Deployment on Vercel

### Step 1: Prepare Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click **Add New...** → **Project**
2. Select your `codebloom` repository
3. Click **Import**

### Step 4: Configure Environment Variables

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
JWT_SECRET = your-secret-key-here (min 32 chars)
DATABASE_URL = mysql://user:password@host:3306/codebloom
AWS_ACCESS_KEY_ID = (if using S3)
AWS_SECRET_ACCESS_KEY = (if using S3)
AWS_REGION = us-east-1
AWS_BUCKET_NAME = (if using S3)
```

### Step 5: Set Build Settings

- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

Vercel should auto-detect these from `vercel.json`

### Step 6: Deploy Database

**Option A: Using PlanetScale (MySQL as a Service)**

1. Create account at [planetscale.com](https://planetscale.com)
2. Create a database named `codebloom`
3. Get the connection string
4. Add to Vercel env vars as `DATABASE_URL`

**Option B: Using AWS RDS**

1. Create MySQL RDS instance
2. Allow connections from Vercel IPs
3. Add connection string to env vars

**Option C: Using DigitalOcean Managed Database**

1. Create Managed Database cluster
2. Get connection string
3. Add to env vars

### Step 7: Run Migrations

After deployment, run migrations on your production database:

```bash
# Locally (with production DATABASE_URL set)
DATABASE_URL=your-production-url pnpm db:push
```

---

## 📁 Project Structure

```
codebloom/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities
│   │   └── styles/        # Tailwind CSS
│   └── public/            # Static assets
├── server/                # Backend
│   ├── _core/
│   │   ├── index.ts       # Server entry point
│   │   ├── auth.ts        # Authentication routes
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── cookies.ts     # Session cookies
│   │   ├── context.ts     # tRPC context
│   │   └── vite.ts        # Vite config
│   ├── db.ts              # Database queries
│   └── routers.ts         # tRPC routers
├��─ shared/                # Shared types
├── vite.config.ts         # Vite config
├── package.json
└── vercel.json           # Vercel config
```

---

## 🔐 Authentication

CodeBloom uses **JWT-based authentication** with email/password login:

### Register
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "Your Name"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

### Logout
```bash
POST /api/auth/logout
```

Tokens expire in **1 year** and are stored in secure HTTP-only cookies.

---

## 🗄️ Database Schema

The app uses MySQL with the following main tables:

- `users` - User accounts with password hashes
- `courses` - Programming courses
- `tasks` - Course tasks/assignments
- `calendar_events` - Weekly calendar events
- `notes` - Learning notes and snippets
- `gardens` - Digital garden flowers

---

## 🛠️ Development

### Available Commands

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Run production build
pnpm check      # Type check
pnpm format     # Format code with Prettier
pnpm test       # Run tests
pnpm db:push    # Run database migrations
```

### Environment

- Frontend: React 19 + Vite
- Backend: Express + tRPC
- Database: MySQL + Drizzle ORM
- Styling: Tailwind CSS
- Forms: React Hook Form
- UI Components: Radix UI
- HTTP Client: Axios / tRPC

---

## 🎨 Design Features

- **Pastel Color Palette** - Soft pinks, purples, blues
- **Rounded Corners** - 12-20px border radius
- **Glassmorphism** - Backdrop blur effects
- **Smooth Animations** - Framer Motion transitions
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Via next-themes

---

## 🐛 Troubleshooting

### Build fails on Vercel
- Check `package.json` build command
- Ensure all env vars are set
- Check TypeScript errors: `pnpm check`

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check if database server is running
- Ensure Vercel IP is whitelisted (if using RDS)

### Authentication issues
- Check `JWT_SECRET` is set (min 32 chars)
- Verify cookies are enabled in browser
- Check browser console for errors

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🌟 Made with ❤️ by [@cataaap24](https://github.com/cataaap24)

**Live Demo**: [codebloom.vercel.app](https://codebloom.vercel.app)

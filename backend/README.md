# Go Train Group Pass - Backend

Welcome to the backend for the Go Train Group Pass application! This README will help you get started, whether you're new to backend development or an experienced developer.

## 📚 What's Inside?

This backend is built with a modern, powerful stack:

- **[NestJS](https://nestjs.com/)** - A progressive Node.js framework for building efficient server-side applications
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with types for better code quality
- **[MikroORM](https://mikro-orm.io/)** - A TypeScript ORM (Object-Relational Mapping) that makes database work easier
- **[PostgreSQL](https://www.postgresql.org/)** - A powerful, open-source relational database
- **[Supabase](https://supabase.com/)** - An open-source Firebase alternative that provides PostgreSQL database, authentication, and more

### What Does Each Technology Do?

- **NestJS**: Think of this as the foundation of your house. It organizes your code, handles HTTP requests, and makes building APIs straightforward
- **TypeScript**: Adds "types" to JavaScript, catching errors before you run your code
- **MikroORM**: Instead of writing raw SQL queries, you work with JavaScript/TypeScript objects. It's like having a translator between your code and the database
- **PostgreSQL**: Where all your data lives (users, trips, schedules, etc.)
- **Supabase**: Provides a PostgreSQL database plus bonus features like authentication and real-time subscriptions

## 🚀 Getting Started

### Prerequisites

Before you start, make sure you have:

1. **[Node.js](https://nodejs.org/)** (version 18 or higher)
   - Check your version: `node --version`
   - [Download here](https://nodejs.org/)

2. **[npm](https://www.npmjs.com/)** (comes with Node.js)
   - Check your version: `npm --version`

3. **A code editor** like [VS Code](https://code.visualstudio.com/) (recommended)

### Two Setup Options

Choose the option that works best for you:

#### 🏠 Option 1: Local Development with Supabase (Recommended)

**Requirements:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- At least 4GB of available RAM
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed

**When to use this:**
- You have a machine that can run Docker
- You want the fastest development experience
- You want to work offline

**Setup Steps:**

1. **Install Supabase CLI**
   ```bash
   # macOS/Linux
   brew install supabase/tap/supabase
   
   # Windows
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   
   # Alternative (any OS with npm)
   npm install -g supabase
   ```

2. **Make sure Docker Desktop is running**
   - Open Docker Desktop
   - Wait until it says "Docker Desktop is running"

3. **Start Supabase**
   ```bash
   # From the project root (not the backend folder)
   cd /path/to/go-train-group-pass
   supabase start
   ```
   
   This will download and start several Docker containers. First time takes 5-10 minutes.
   
   You'll see output like:
   ```
   Started supabase local development setup.
   
   API URL: http://127.0.0.1:54321
   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   Studio URL: http://127.0.0.1:54323
   ```

4. **Set up your environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   The default values in `.env` should work as-is for local development!

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Run database migrations**
   ```bash
   npm run migration:up
   ```
   
   This creates all the database tables you need.

7. **Start the backend**
   ```bash
   npm run start:dev
   ```

8. **Visit Supabase Studio**
   
   Open http://localhost:54323 in your browser to see your database, run SQL queries, and more!

#### ☁️ Option 2: Hosted Supabase (Alternative)

**When to use this:**
- Your machine doesn't meet Docker's requirements
- You prefer cloud-based development
- You're having issues with local Supabase

**Setup Steps:**

1. **Create a free Supabase account**
   - Go to [supabase.com](https://supabase.com/)
   - Click "Start your project"
   - Sign up with GitHub (recommended) or email

2. **Create a new project**
   - Click "New Project"
   - Give it a name like "go-train-group-pass-dev"
   - Choose a database password (save this!)
   - Select a region close to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get your database connection string**
   - In your Supabase project, go to **Settings** → **Database**
   - Scroll to "Connection string"
   - Copy the "Connection pooling" string (recommended for better performance)
   - It looks like: `postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:6543/postgres`

4. **Set up your environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit the `.env` file and replace the `DATABASE_URL` line:
   ```env
   DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@[region].pooler.supabase.com:6543/postgres
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Run database migrations**
   ```bash
   npm run migration:up
   ```

7. **Start the backend**
   ```bash
   npm run start:dev
   ```

8. **Access your database**
   
   Go to your Supabase project dashboard → **Table Editor** to view your data

## 🛠️ Common Commands

Once you're set up, here are the commands you'll use most:

### Development

```bash
# Start the backend in development mode (auto-reloads on changes)
npm run start:dev

# Start in production mode
npm run start:prod

# Run tests
npm run test

# Run linting (check code quality)
npm run lint
```

### Database Migrations

```bash
# Create a new migration (when you change entity files)
npm run migration:create

# Run all pending migrations
npm run migration:up

# Rollback the last migration
npm run migration:down

# Check migration status
npm run migration:pending
```

### Supabase (Local Only)

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Check Supabase status
supabase status

# Reset database (careful! deletes all data)
supabase db reset
```

## 📁 Project Structure

Here's what's in the backend folder:

```
backend/
├── src/
│   ├── entities/          # Database models (Agency, Trip, etc.)
│   ├── modules/           # Feature modules (ORM setup, etc.)
│   ├── database/
│   │   ├── migrations/    # Database schema changes
│   │   └── seeders/       # Sample data for testing
│   ├── app.module.ts      # Main application module
│   ├── main.ts            # Application entry point
│   └── mikro-orm.config.ts # Database configuration
├── test/                  # Test files
├── .env                   # Environment variables (YOU create this)
├── .env.example           # Example environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file!
```

### Key Files Explained

- **entities/**: These are your data models. Each file represents a database table
- **migrations/**: Tracks changes to your database structure over time
- **mikro-orm.config.ts**: Tells MikroORM how to connect to your database
- **.env**: Your secret configuration (database passwords, API keys, etc.) - NEVER commit this!

## 🐛 Troubleshooting

### "Cannot connect to database"

**Local Supabase:**
1

# Supabase Backend Setup Guide

This guide explains how to set up and use Supabase with the NestJS backend.

## Overview

The backend is configured to work with Supabase PostgreSQL database using MikroORM as the ORM. You can use either:
- **Local Supabase** for development (recommended)
- **Hosted Supabase** for production

## Local Development Setup

### 1. Prerequisites

Ensure you have the following installed:
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- Docker Desktop (required for local Supabase)

### 2. Start Supabase Locally

```bash
# From the project root
cd /Users/jess/civic_tech/go-train-group-pass

# Start Supabase (this will start Docker containers)
supabase start
```

This will start the local Supabase stack on these ports (as configured in `supabase/config.toml`):
- **PostgreSQL Database**: `localhost:54322`
- **Studio (Web UI)**: `http://localhost:54323`
- **API**: `http://localhost:54321`
- **Inbucket (Email testing)**: `http://localhost:54324`

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd backend
cp ../.env.example .env
```

For local development, the default values should work:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DB_HOST=localhost
DB_PORT=54322
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
NODE_ENV=development
```

### 4. Run Database Migrations

Once Supabase is running and your backend is configured:

```bash
cd backend

# Install dependencies if not already done
npm install

# Run migrations to set up the database schema
npm run migration:up

# Optional: Run seeders to populate initial data
npm run seed
```

### 5. Start the Backend

```bash
npm run start:dev
```

The NestJS backend should now connect to your local Supabase database!

## Production Setup (Hosted Supabase)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project's connection details

### 2. Get Connection String

From your Supabase project dashboard:
1. Go to **Settings** → **Database**
2. Find the **Connection string** section
3. Use the **Connection pooling** string for better performance

Example format:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 3. Configure Production Environment

Update your production `.env` with the hosted connection string:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
NODE_ENV=production
```

### 4. Run Migrations

Run migrations against your hosted database:

```bash
npm run migration:up
```

## Useful Commands

### Supabase CLI

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# View Supabase status
supabase status

# Access Studio (web UI)
# Open http://localhost:54323 in your browser

# Generate TypeScript types from database
supabase gen types typescript --local > types/supabase.ts
```

### Database Migrations (MikroORM)

```bash
# Create a new migration
npm run migration:create

# Run pending migrations
npm run migration:up

# Rollback last migration
npm run migration:down

# Check migration status
npm run migration:pending
```

### Database Access

You can access the database using:

1. **Supabase Studio**: http://localhost:54323 (local)
2. **SQL Editor**: Available in Studio
3. **psql CLI**:
   ```bash
   psql postgresql://postgres:postgres@localhost:54322/postgres
   ```

## Configuration Details

### MikroORM Configuration

The MikroORM configuration (`backend/src/mikro-orm.config.ts`) supports:
- Environment-based connection parameters
- Automatic migration management
- Entity discovery
- Debug logging (disabled in production)

### Supabase Configuration

The Supabase configuration (`supabase/config.toml`) defines:
- Local port mappings (avoid conflicts)
- Database version (PostgreSQL 17)
- API settings
- Auth configuration
- Storage settings

## Troubleshooting

### Port Conflicts

If you get port conflict errors, check if other services are using:
- `54321` (API)
- `54322` (Database)
- `54323` (Studio)

You can modify these in `supabase/config.toml` if needed.

### Connection Issues

1. **Verify Supabase is running**:
   ```bash
   supabase status
   ```

2. **Check Docker containers**:
   ```bash
   docker ps
   ```

3. **Test database connection**:
   ```bash
   psql postgresql://postgres:postgres@localhost:54322/postgres
   ```

### Migration Issues

If migrations fail:
1. Check that Supabase is running
2. Verify environment variables are correct
3. Check migration files in `backend/src/database/migrations/`
4. Review logs for specific error messages

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [MikroORM Documentation](https://mikro-orm.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)

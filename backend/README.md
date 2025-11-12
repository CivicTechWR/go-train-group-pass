# Go Train Group Pass - Backend

Backend API for the Go Train Group Pass application, built with NestJS, MikroORM, and Supabase for authentication.

## Tech Stack

- **Framework**: NestJS + Fastify
- **Database**: PostgreSQL with MikroORM
- **Authentication**: Supabase Auth
- **Testing**: Vitest
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Supabase CLI** (for local development)
- **Docker** (required for local Supabase)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CivicTechWR/go-train-group-pass.git
cd go-train-group-pass/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration (local development)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Application Configuration
PORT=3000
FRONTEND_URL=http://localhost:3000
```

> **Note**: The keys above are default local development keys from Supabase. For production, use keys from your Supabase project dashboard.

### 4. Start Supabase (Local Development)

```bash
# From the project root directory
cd ..
supabase start
```

This will start local Supabase services including PostgreSQL. Note the connection details displayed.

### 5. Run Database Migrations

```bash
# Back in the backend directory
cd backend
npm run migrate:up
```

This creates the necessary database tables (users, routes, stops, etc.).

### 6. Start the Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Start production build
npm run start:prod

# Build the project
npm run build
```

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Database

```bash
# Create a new migration
npm run migrate:create

# Run pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Check current migration status
npm run migrate:pending
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   ├── supabase.service.ts
│   │   └── users.service.ts
│   ├── entities/          # Database entities
│   │   ├── user.entity.ts
│   │   ├── route.entity.ts
│   │   ├── stop.entity.ts
│   │   └── ...
│   ├── modules/           # Feature modules
│   │   └── orm.module.ts
│   ├── database/          # Database migrations
│   │   └── migrations/
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment config
├── mikro-orm.config.ts    # ORM configuration
├── vitest.config.ts       # Test configuration
└── package.json
```

## Authentication

This application uses Supabase for authentication with JWT tokens. See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed information about:

- Authentication architecture
- API endpoints
- Using the AuthGuard
- Testing the auth system
- Security best practices

### Quick Example

```typescript
// Protect a route
@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(AuthGuard)
  async getData(@Request() req) {
    const user = req.user; // User attached by AuthGuard
    return { data: 'sensitive info', userId: user.id };
  }
}
```

## API Documentation

### Base URL

```
http://localhost:3000
```

### Main Endpoints

- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in existing user
- `POST /auth/signout` - Sign out current user
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token
- `POST /auth/password/reset-request` - Request password reset
- `POST /auth/password/update` - Update password

For complete API documentation, see [AUTH_SETUP.md](./AUTH_SETUP.md).

## Testing

### Running Tests

The project uses Vitest for testing. Note that there are currently some compatibility issues between Vitest and NestJS's testing utilities that are being addressed.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:cov
```

### Known Issues

Tests are experiencing dependency injection issues with Vitest. If you encounter test failures related to undefined dependencies, consider:

1. Using Jest instead of Vitest (more compatible with NestJS)
2. Installing `@vitest/jest-compat` for better Jest compatibility
3. Manually instantiating classes in tests instead of using `Test.createTestingModule()`

## Deployment

### Managed Supabase (Production / Hosted Instance)

Use this when running against Supabase's hosted (official) infrastructure instead of local Supabase.

1. Create Supabase account and organization:
   - Go to https://supabase.com
   - Create a free tier account and an organization.

2. Create a new Supabase project:
   - Select your organization and region.
   - Set an initial database password (you can reset it after).

3. Get Supabase API values:
   - Go to: Settings → API
   - Capture:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (server-side only, keep secret)

4. Reset and capture the database password:
   - Go to: Settings → Database → Reset Database Password
   - Use this as `DB_PASSWORD`.

5. Get database connection parameters via the session pooler:
   - In the project dashboard, click "Connect".
   - Choose:
     - Type: `PSQL`
     - Source: `Primary database`
     - Method: `Session pooler`
   - Click "View parameters" and map:
     - `host` → `DB_HOST`
     - `port` → `DB_PORT`
     - `user` → `DB_USER`
     - `database` → `DB_NAME`
   - Additionally configure:
     - `POOL_MODE=session`

6. Configure your `.env` for managed Supabase (example):

   ```env
   # Supabase API
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-production-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

   # Managed Supabase database (session pooler)
   DB_HOST=aws-0-xxx.pooler.supabase.com
   DB_PORT=6543
   DB_USER=postgres.your-project-ref
   DB_PASSWORD=your-db-password
   DB_NAME=postgres
   POOL_MODE=session

   # MikroORM / application DB URL using pooler
   DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require&pool_mode=${POOL_MODE}

   # Application Config
   PORT=3000
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

7. Run migrations against the managed database:

   ```bash
   npm run migrate:up
   ```

8. Build and run in production mode:

   ```bash
   npm run build
   npm run start:prod
   ```

### Build and Run

```bash
# Build the application
npm run build

# Run in production mode
npm run start:prod
```

## Troubleshooting

### Cannot connect to database

```bash
# Check if Supabase is running
supabase status

# Check database connection
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### Port already in use

```bash
# Change PORT in .env file
PORT=3001
```

### Migration errors

```bash
# Reset database (WARNING: deletes all data)
npm run migrate:down
npm run migrate:up
```

### Authentication errors

- Verify `SUPABASE_URL` and keys in `.env`
- Ensure Supabase is running: `supabase status`
- Check that migrations have run successfully

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure code passes linting: `npm run lint`
5. Format code: `npm run format`  
6. Submit a pull request

## Additional Documentation

- [AUTH_SETUP.md](./AUTH_SETUP.md) - Detailed authentication documentation
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase setup guide
- [NestJS Documentation](https://docs.nestjs.com)
- [MikroORM Documentation](https://mikro-orm.io)
- [Supabase Documentation](https://supabase.com/docs)

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Open an issue on GitHub
- Contact the CivicTech WR team

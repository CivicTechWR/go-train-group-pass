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
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

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

This starts local Supabase services. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed configuration options and troubleshooting.

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

### Environment Variables for Production

Update your `.env` with production values:

```env
# Production Supabase (get from Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Production Database
DATABASE_URL=postgresql://user:password@host:port/database

# Production Config
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
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

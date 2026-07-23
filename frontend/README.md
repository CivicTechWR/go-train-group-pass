# Go Train Group Pass - Frontend

The frontend base for the Go Train Group Pass, built with Next.js, React, and TypeScript. Features a complete authentication system with automatic token refresh, route protection, and secure cookie-based session management. The UI around these functionalities is to be changed when the final UI design is ready.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **State Management**: React Context API
- **Authentication**: httpOnly Cookies + JWT Tokens

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Backend API** running (see [backend README](../backend/README.md))

## Getting Started

### 1. Navigate to ./frontend

```bash
cd go-train-group-pass/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If you're using backend defaults then you're ready to go.

> **Note**: The frontend runs on port `3001` by default to avoid conflicts with the backend (port `3000`). This is set in [package.json](./package.json)

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Build the project for production
npm run build

# Start production server
npm run start
```

### Code Quality

```bash
# Lint code
npm run lint
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth route group
│   │   ├── signin/         # Sign in page
│   │   ├── signup/         # Sign up page
│   │   └── forgot-password/ # Password reset request page
│   ├── api/                 # Next.js API routes (proxy to backend)
│   │   └── auth/           # Authentication API routes
│   ├── change-password/     # Password update page
│   ├── protected/          # Protected route example
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/              # React components
│   └── auth/               # Authentication components
│       ├── SignInForm.tsx
│       ├── SignUpForm.tsx
│       ├── PasswordResetRequestForm.tsx
│       └── PasswordUpdateForm.tsx
├── contexts/               # React Context providers
│   └── AuthContext.tsx     # Authentication state management
├── lib/                    # Utility libraries
│   ├── api.ts             # API client with auto-refresh
│   └── types.ts           # Zod schemas and TypeScript types
├── middleware.ts           # Next.js middleware for route protection
└── package.json
```

## Authentication Architecture

### Overview

The frontend implements a secure authentication system that:

- Uses **httpOnly cookies** for token storage (prevents XSS attacks)
- Automatically refreshes expired access tokens
- Protects routes server-side via Next.js middleware
- Validates all API responses with Zod schemas
- Manages authentication state with React Context

### Authentication Flow

```
User Action (Sign In/Sign Up)
    ↓
Frontend Form Component
    ↓
Next.js API Route (/api/auth/*)
    ↓
Backend API (/auth/*)
    ↓
Tokens stored in httpOnly cookies
    ↓
Middleware validates token on each request
    ↓
Automatic refresh if token expired
```

### Key Components

#### 1. **AuthContext** (`contexts/AuthContext.tsx`)

Provides global authentication state and methods:

```typescript
const { user, loading, signIn, signUp, signOut, refreshUser } = useAuth();
```

- `user`: Current authenticated user or `null`
- `loading`: Initial auth check status
- `signIn`: Sign in with email/password
- `signUp`: Create new account
- `signOut`: Sign out and clear session
- `refreshUser`: Manually refresh user data

#### 2. **API Client** (`lib/api.ts`)

Handles all API requests with automatic token refresh:

- Automatically retries failed requests after token refresh
- Prevents multiple simultaneous refresh attempts
- Includes cookies in all requests (`credentials: 'include'`)

#### 3. **Middleware** (`middleware.ts`)

Server-side route protection:

- Validates tokens before page rendering
- Automatically refreshes expired tokens
- Redirects unauthenticated users to signin
- Redirects authenticated users away from auth pages

#### 4. **API Routes** (`app/api/auth/*`)

Next.js API routes that proxy requests to the backend:

- Validate request/response schemas with Zod
- Set/clear httpOnly cookies
- Prevent caching for security
- Handle errors gracefully

### Route Protection

Routes are protected by default except for:

- `/` - Home page
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/forgot-password` - Password reset request

All other routes require authentication. Unauthenticated users are redirected to `/signin` with a `redirect` query parameter.

### Token Management

#### Access Token

- Stored in httpOnly cookie: `access_token`
- Expires after 1 hour (configurable)
- Automatically refreshed when expired

#### Refresh Token

- Stored in httpOnly cookie: `refresh_token`
- Expires after 7 days
- Used to obtain new access tokens

#### Automatic Refresh

When an access token expires:

1. **Client-side** (`lib/api.ts`): API calls detect 401 responses and automatically refresh the token, then retry the request
2. **Server-side** (`middleware.ts`): Middleware validates tokens and refreshes expired ones before allowing page access

### Security Features

1. **httpOnly Cookies**: Tokens cannot be accessed via JavaScript (prevents XSS)
2. **Secure Cookies**: In production, cookies are only sent over HTTPS
3. **SameSite Protection**: Cookies use `lax` SameSite policy
4. **Schema Validation**: All API responses validated with Zod
5. **Server-side Protection**: Routes protected at middleware level (no flash of content)
6. **Automatic Token Refresh**: Seamless user experience without manual re-login

## API Routes

The frontend uses Next.js API routes as a proxy to the backend:

### Authentication Routes

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user
- `POST /api/auth/signout` - Sign out current user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/password/reset-request` - Request password reset email
- `POST /api/auth/password/update` - Update user password

All routes:

- Validate request bodies with Zod
- Validate backend responses with Zod
- Set/clear httpOnly cookies
- Prevent caching (`Cache-Control: no-store`)

## Pages

### Public Pages

- `/` - Home page
- `/signin` - Sign in form
- `/signup` - Sign up form
- `/forgot-password` - Request password reset email

### Protected Pages

- `/protected` - Example protected page
- `/change-password` - Update password (authenticated users)

## Environment Variables

### Required

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

> **Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never include secrets in these variables.

## Styling

The project uses **Tailwind CSS 4**. [global.css](./app/globals.css) contains CSS variables for theming.

## Testing

Currently, the frontend does not have automated tests.

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Ensure `NEXT_PUBLIC_API_URL` is set to your production backend URL.

### Recommended Platforms (until hosting platform is decided):

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted** (Node.js server)

## Troubleshooting

### Port Already in Use

The frontend runs on port `3001` by default. To change:

```bash
# Update package.json scripts or use:
PORT=3002 npm run dev
```

### Cannot Connect to Backend

1. Verify backend is running: `http://localhost:3000`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Ensure CORS is configured on backend (if different origins)

### Authentication Issues

1. **Tokens not persisting**: Check browser cookie settings
2. **Redirect loops**: Verify middleware logic and public routes
3. **401 errors**: Check token expiry and refresh token validity
4. **CORS errors**: Ensure backend allows frontend origin

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Code Style

- Use TypeScript for type safety
- Validate all API responses with Zod
- Use React Context for global state
- Prefer Next.js `<Link>` over `router.push()` for navigation

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code passes linting: `npm run lint`
4. Test authentication flows manually
5. Submit a pull request

## Additional Documentation

- [Backend README](../backend/README.md) - Backend API documentation
- [Backend Auth Setup](../backend/AUTH_SETUP.md) - Detailed authentication documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [React Documentation](https://react.dev) - React features and hooks
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Tailwind CSS utilities

## Support

For questions or issues:

- Open an issue on GitHub
- Contact the CivicTech WR team

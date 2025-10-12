import { NextResponse, type NextRequest } from 'next/server';

// Security headers configuration
const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
    'upgrade-insecure-requests',
  ].join('; '),

  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
} as const;

// Additional headers for API routes
const apiHeaders = {
  ...securityHeaders,
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

// Headers for static assets
const staticHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
} as const;

// Headers for HTML pages
const htmlHeaders = {
  ...securityHeaders,
  'Cache-Control': 'public, max-age=0, must-revalidate',
} as const;

export function addSecurityHeaders(
  response: NextResponse,
  type: 'api' | 'html' | 'static' = 'html'
): NextResponse {
  const headers =
    type === 'api'
      ? apiHeaders
      : type === 'static'
        ? staticHeaders
        : htmlHeaders;

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Middleware for adding security headers
export function securityHeadersMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Determine content type
  const pathname = request.nextUrl.pathname;
  let type: 'api' | 'html' | 'static' = 'html';

  if (pathname.startsWith('/api/')) {
    type = 'api';
  } else if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    type = 'static';
  }

  return addSecurityHeaders(response, type);
}

// CORS configuration for API routes
export const corsHeaders = {
  'Access-Control-Allow-Origin':
    process.env.NODE_ENV === 'production'
      ? 'https://go-transit.dredre.net'
      : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
} as const;

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  if (!token || !sessionToken) return false;
  return token === sessionToken;
}

// Request size limits
export const REQUEST_LIMITS = {
  MAX_BODY_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_HEADER_SIZE: 8 * 1024, // 8KB
  MAX_URL_LENGTH: 2048, // 2KB
} as const;

// Validate request size
export function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > REQUEST_LIMITS.MAX_BODY_SIZE) {
    return false;
  }

  if (request.url.length > REQUEST_LIMITS.MAX_URL_LENGTH) {
    return false;
  }

  return true;
}

// Security event logging
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  request: NextRequest
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: getClientIP(request.headers),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
  };

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    console.log('SECURITY_EVENT:', JSON.stringify(logData));
  } else {
    console.log('SECURITY_EVENT:', logData);
  }
}

// Get client IP address
function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const remoteAddr = headers.get('x-remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (remoteAddr) {
    return remoteAddr;
  }

  return 'unknown';
}

import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');
export const displayNameSchema = z
  .string()
  .min(1, 'Display name required')
  .max(50, 'Display name too long');
export const coachNumberSchema = z
  .string()
  .regex(/^\d{4}$/, 'Coach number must be 4 digits');
export const coachLevelSchema = z.enum(['upper', 'lower', 'middle'], {
  message: 'Coach level must be upper, lower, or middle',
});

// Trip-related validations
export const joinTripSchema = z.object({
  tripId: uuidSchema,
});

export const leaveTripSchema = z.object({
  tripId: uuidSchema,
});

export const updateLocationSchema = z.object({
  groupId: uuidSchema,
  coachNumber: coachNumberSchema,
  coachLevel: coachLevelSchema,
});

// Group-related validations
export const volunteerStewardSchema = z.object({
  groupId: uuidSchema,
});

export const uploadPassSchema = z.object({
  groupId: uuidSchema,
  passScreenshotUrl: z.string().url('Invalid URL format'),
  passTicketNumber: z
    .string()
    .min(1, 'Ticket number required')
    .max(20, 'Ticket number too long'),
  passActivatedAt: z.string().datetime('Invalid datetime format'),
  passengerCount: z
    .number()
    .int()
    .min(1, 'Passenger count must be at least 1')
    .max(10, 'Passenger count too high'),
});

export const markPaymentSentSchema = z.object({
  groupMembershipId: uuidSchema,
});

// Alert-related validations
export const triggerAlertSchema = z.object({
  groupId: uuidSchema,
});

export const acknowledgeAlertSchema = z.object({
  alertId: uuidSchema,
});

// Profile-related validations
export const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  profilePhotoUrl: z.string().url('Invalid URL format').optional(),
  fcmToken: z.string().min(1, 'FCM token required').optional(),
});

// Rate limiting schemas
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier required'),
  action: z.string().min(1, 'Action required'),
  limit: z.number().int().min(1, 'Limit must be positive'),
  windowMs: z.number().int().min(1000, 'Window must be at least 1 second'),
});

// File upload validations
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File required' }),
  maxSize: z
    .number()
    .int()
    .min(1, 'Max size must be positive')
    .default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z
    .array(z.string())
    .default(['image/jpeg', 'image/png', 'image/webp']),
});

// Sanitization helpers
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeDisplayName = (input: string): string => {
  return sanitizeString(input).substring(0, 50);
};

export const sanitizeCoachNumber = (input: string): string => {
  return input.replace(/\D/g, '').substring(0, 4);
};

// Validation error formatter
export const formatValidationError = (error: z.ZodError): string => {
  return error.issues
    .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
};

// Common validation patterns
export const patterns = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  coachNumber: /^\d{4}$/,
  displayName: /^[a-zA-Z0-9\s\-_@.]+$/,
  ticketNumber: /^[A-Z0-9]{8,20}$/,
} as const;

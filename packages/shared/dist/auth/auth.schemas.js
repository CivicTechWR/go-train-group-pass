"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchema = exports.PasswordUpdateSchema = exports.PasswordResetRequestSchema = exports.SignInDtoSchema = exports.SignUpDtoSchema = exports.UserMetadataSchema = void 0;
exports.parseUserMetadata = parseUserMetadata;
const zod_1 = require("zod");
exports.UserMetadataSchema = zod_1.z.object({
    full_name: zod_1.z.string(),
    phone_number: zod_1.z.string().optional(),
});
exports.SignUpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must not exceed 72 characters'),
    fullName: zod_1.z.string().min(1, 'Full name must not be empty'),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
        .optional(),
});
exports.SignInDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.PasswordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.PasswordUpdateSchema = zod_1.z.object({
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must not exceed 72 characters'),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
function parseUserMetadata(metadata) {
    const result = exports.UserMetadataSchema.safeParse(metadata);
    if (!result.success) {
        throw new Error('Invalid user metadata format');
    }
    return result.data;
}
//# sourceMappingURL=auth.schemas.js.map
import { z } from 'zod';
export declare const UserMetadataSchema: z.ZodObject<{
    full_name: z.ZodString;
    phone_number: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserMetadata = z.infer<typeof UserMetadataSchema>;
export declare const SignUpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    phoneNumber: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SignUp = z.infer<typeof SignUpDtoSchema>;
export declare const SignInDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type SignIn = z.infer<typeof SignInDtoSchema>;
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export declare const PasswordUpdateSchema: z.ZodObject<{
    newPassword: z.ZodString;
}, z.core.$strip>;
export type PasswordUpdate = z.infer<typeof PasswordUpdateSchema>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export declare function parseUserMetadata(metadata: unknown): UserMetadata;

declare const SignUpDto_base: import("nestjs-zod").ZodDto<import("zod").ZodObject<{
    email: import("zod").ZodString;
    password: import("zod").ZodString;
    fullName: import("zod").ZodString;
    phoneNumber: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>> & {
    io: "input";
};
export declare class SignUpDto extends SignUpDto_base {
}
declare const SignInDto_base: import("nestjs-zod").ZodDto<import("zod").ZodObject<{
    email: import("zod").ZodString;
    password: import("zod").ZodString;
}, import("zod/v4/core").$strip>> & {
    io: "input";
};
export declare class SignInDto extends SignInDto_base {
}
declare const RefreshTokenDto_base: import("nestjs-zod").ZodDto<import("zod").ZodObject<{
    refreshToken: import("zod").ZodString;
}, import("zod/v4/core").$strip>> & {
    io: "input";
};
export declare class RefreshTokenDto extends RefreshTokenDto_base {
}
declare const PasswordResetRequestDto_base: import("nestjs-zod").ZodDto<import("zod").ZodObject<{
    email: import("zod").ZodString;
}, import("zod/v4/core").$strip>> & {
    io: "input";
};
export declare class PasswordResetRequestDto extends PasswordResetRequestDto_base {
}
declare const PasswordUpdateDto_base: import("nestjs-zod").ZodDto<import("zod").ZodObject<{
    newPassword: import("zod").ZodString;
}, import("zod/v4/core").$strip>> & {
    io: "input";
};
export declare class PasswordUpdateDto extends PasswordUpdateDto_base {
}
export {};

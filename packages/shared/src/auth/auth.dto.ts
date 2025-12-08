import { createZodDto } from 'nestjs-zod';
import {
  SignUpInputSchema,
  SignInInputSchema,
  RefreshTokenSchema,
  PasswordResetInputSchema,
  PasswordUpdateInputSchema,
  PasswordResetResponseSchema,
  AuthResponseSchema,
  UserSchema,
} from './auth.schemas';

export class SignUpInputDto extends createZodDto(SignUpInputSchema) {}

export class SignInInputDto extends createZodDto(SignInInputSchema) {}

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}

export class PasswordResetInputDto extends createZodDto(
  PasswordResetInputSchema,
) {}

export class PasswordUpdateInputDto extends createZodDto(
  PasswordUpdateInputSchema,
) {}

export class PasswordResetResponseDto extends createZodDto(
  PasswordResetResponseSchema,
) {}

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

export class UserDto extends createZodDto(UserSchema) {}

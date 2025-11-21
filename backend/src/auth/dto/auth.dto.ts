import { createZodDto } from 'nestjs-zod';
import {
  SignUpDtoSchema,
  SignInDtoSchema,
  RefreshTokenSchema,
  PasswordResetRequestSchema,
  PasswordUpdateSchema,
  PasswordResetSchema,
} from '../auth.schemas';

export class SignUpDto extends createZodDto(SignUpDtoSchema) {}

export class SignInDto extends createZodDto(SignInDtoSchema) {}

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}

export class PasswordResetRequestDto extends createZodDto(
  PasswordResetRequestSchema,
) {}

export class PasswordUpdateDto extends createZodDto(PasswordUpdateSchema) {}

export class PasswordResetDto extends createZodDto(PasswordResetSchema) {}

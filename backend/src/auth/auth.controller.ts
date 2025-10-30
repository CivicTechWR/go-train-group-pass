import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignUpDtoSchema,
  SignInDtoSchema,
  PasswordResetRequestSchema,
  PasswordUpdateSchema,
  RefreshTokenSchema,
} from './auth.schemas';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: unknown) {
    const parseResult = SignUpDtoSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues);
    }
    return this.authService.signUp(parseResult.data);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: unknown) {
    const parseResult = SignInDtoSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues);
    }
    return this.authService.signIn(parseResult.data);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut() {
    return this.authService.signOut();
  }

  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization?: string) {
    const token = this.extractToken(authorization);
    return this.authService.getUserFromToken(token);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: unknown) {
    const parseResult = RefreshTokenSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues);
    }
    return this.authService.refreshToken(parseResult.data.refreshToken);
  }

  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() body: unknown) {
    const parseResult = PasswordResetRequestSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues);
    }
    return this.authService.requestPasswordReset(parseResult.data.email);
  }

  @Post('password/update')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    const token = this.extractToken(authorization);
    const parseResult = PasswordUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues);
    }
    return this.authService.updatePassword(token, parseResult.data.newPassword);
  }

  private extractToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid authorization header format. Expected: Bearer <token>',
      );
    }

    return parts[1];
  }
}

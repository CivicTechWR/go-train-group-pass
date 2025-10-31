import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { SignUpDto, SignInDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Headers('authorization') authorization?: string) {
    const token = this.extractToken(authorization);
    return this.authService.signOut(token);
  }

  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization?: string) {
    const token = this.extractToken(authorization);
    return this.authService.getUserFromToken(token);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body('email') email: string) {
    if (!email) {
      throw new UnauthorizedException('Email is required');
    }
    return this.authService.requestPasswordReset(email);
  }

  @Post('password/update')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body('newPassword') newPassword: string,
  ) {
    const token = this.extractToken(authorization);
    if (!newPassword) {
      throw new UnauthorizedException('New password is required');
    }
    return this.authService.updatePassword(token, newPassword);
  }

  private extractToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>');
    }

    return parts[1];
  }
}

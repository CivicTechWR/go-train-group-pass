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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignUpInputDto,
  SignInInputDto,
  RefreshTokenDto,
  PasswordResetInputDto,
  PasswordUpdateInputDto,
  PasswordResetResponseDto,
  AuthResponseDto,
  UserDto,
  AuthResponseSchema,
  UserSchema,
} from '@go-train-group-pass/shared';
import { Serialize } from '../../common/decorators/serialize.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: SignUpInputDto) {
    return this.authService.signUp(body);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(HttpStatus.OK)
  @Serialize(AuthResponseSchema)
  async signIn(@Body() body: SignInInputDto) {
    return this.authService.signIn(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Serialize(UserSchema)
  async getCurrentUser(@Headers('authorization') authorization?: string) {
    const token = this.extractToken(authorization);
    return this.authService.getUserFromToken(token);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(HttpStatus.OK)
  @Serialize(AuthResponseSchema)
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('password/reset-request')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() body: PasswordResetInputDto) {
    await this.authService.requestPasswordReset(body);
    return { message: 'Password reset email sent', invalid: 'invalid' };
  }

  @Post('password/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: PasswordUpdateInputDto,
  ): Promise<{ message: string }> {
    const token = this.extractToken(authorization);
    await this.authService.updatePassword(token, body);
    return { message: 'Password updated successfully' };
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password using recovery token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: PasswordResetResponseDto) {
    await this.authService.resetPassword(body.recoveryToken, body.newPassword);
    return { message: 'Password successfully reset' };
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

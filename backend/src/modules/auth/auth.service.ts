import {
  AuthResponseDto,
  PasswordResetInputDto,
  PasswordUpdateInputDto,
  SignInInputDto,
  SignUpInputDto,
  UserDto,
} from '@go-train-group-pass/shared';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SupabaseService } from './supabase.service';

import { IAuthService } from './auth.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sign up a new user using Supabase Auth and create a user record in our database
   */
  async signUp(signUpInput: SignUpInputDto): Promise<void> {
    const { email, password, fullName, phoneNumber } = signUpInput;

    if (!fullName) {
      throw new BadRequestException('Full name is required');
    }
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }
    const { data: authData, error: authError } =
      await this.supabaseService.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
          },
        },
      });

    if (authError) {
      throw new BadRequestException(authError.message);
    }

    if (!authData.user) {
      throw new BadRequestException('Failed to create user');
    }

    await this.usersService.create({
      email,
      authUserId: authData.user.id,
      name: fullName,
      phoneNumber,
    });

    return;
  }

  async signIn(signInDto: SignInInputDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    const { data: authData, error: authError } =
      await this.supabaseService.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      throw new UnauthorizedException(
        authError?.message ?? 'Authentication failed',
      );
    }

    const user = await this.usersService.findByAuthUserIdOrFail(
      authData.user.id,
    );

    await this.usersService.updateLastSignIn(user.id);

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  async requestPasswordReset(
    passwordResetInfo: PasswordResetInputDto,
  ): Promise<void> {
    const { email } = passwordResetInfo;
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }

    const { error } = await this.supabaseService.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${frontendUrl}/auth/reset-password`,
      },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return;
  }

  async updatePassword(
    accessToken: string,
    passwordUpdateInput: PasswordUpdateInputDto,
  ): Promise<void> {
    const { newPassword } = passwordUpdateInput;

    const {
      data: { user: authUser },
      error: userError,
    } = await this.supabaseService.auth.getUser(accessToken);

    if (userError || !authUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { error } = await this.supabaseService.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return;
  }

  async resetPassword(
    recoveryToken: string,
    newPassword: string,
  ): Promise<void> {
    const {
      data: { user: authUser },
      error: userError,
    } = await this.supabaseService.auth.getUser(recoveryToken);

    if (userError || !authUser) {
      throw new UnauthorizedException('Invalid or expired recovery token');
    }

    const { error } = await this.supabaseService.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return;
  }

  async getUserFromToken(token: string): Promise<UserDto> {
    const {
      data: { user },
      error,
    } = await this.supabaseService.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    const localUser = await this.usersService.findByAuthUserIdOrFail(user.id);

    return {
      id: localUser.id,
      email: localUser.email,
      name: localUser.name,
      phoneNumber: localUser.phoneNumber,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const { data, error } = await this.supabaseService.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.session || !data.user) {
      throw new BadRequestException('Failed to refresh session');
    }

    const user = await this.usersService.findByAuthUserIdOrFail(data.user?.id);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    };
  }
}

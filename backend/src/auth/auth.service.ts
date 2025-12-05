import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { UsersService } from '../users/users.service';
import { SignUp, SignIn, parseUserMetadata } from '@go-train-group-pass/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sign up a new user using Supabase Auth and create a user record in our database
   */
  async signUp(signUpDto: SignUp) {
    const { email, password, fullName, phoneNumber } = signUpDto;

    if (!fullName) {
      throw new BadRequestException('Full name is required');
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
    // Create user in our database
    const user = await this.usersService.create({
      email,
      authUserId: authData.user.id,
      name: fullName,
      phoneNumber,
    });

    return {
      user: this.usersService.formatUserResponse(user),
      session: authData.session,
    };
  }

  async signIn(signInDto: SignIn) {
    const { email, password } = signInDto;

    // Authenticate with Supabase
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

    const userMetadata = parseUserMetadata(authData.user.user_metadata);

    if (!authData.user.email) {
      throw new UnauthorizedException('Email is required');
    }

    // Find or create user in our database
    const user = await this.usersService.findOrCreate({
      email: authData.user.email,
      authUserId: authData.user.id,
      name: userMetadata.full_name,
      phoneNumber: userMetadata.phone_number,
    });

    // Update last sign in time
    await this.usersService.updateLastSignIn(user.id);

    return {
      user: this.usersService.formatUserResponse(user),
      session: authData.session,
    };
  }

  async signOut() {
    const { error } = await this.supabaseService.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Signed out successfully' };
  }

  async getUserFromToken(accessToken: string) {
    const {
      data: { user: authUser },
      error,
    } = await this.supabaseService.auth.getUser(accessToken);

    if (error || !authUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.findByAuthUserId(authUser.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.formatUserResponse(user);
  }

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabaseService.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      session: data.session,
    };
  }

  async requestPasswordReset(email: string) {
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

    return { message: 'Password reset email sent' };
  }

  async updatePassword(accessToken: string, newPassword: string) {
    // First verify the token
    const {
      data: { user: authUser },
      error: userError,
    } = await this.supabaseService.auth.getUser(accessToken);

    if (userError || !authUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Update password
    const { error } = await this.supabaseService.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Password updated successfully' };
  }

  async resetPassword(recoveryToken: string, newPassword: string) {
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

    return { message: 'Password reset successfully' };
  }
}

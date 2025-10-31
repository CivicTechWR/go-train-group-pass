import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { UsersService } from './users.service';

export interface SignUpDto {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sign up a new user using Supabase Auth and create a user record in our database
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, fullName, phoneNumber } = signUpDto;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await this.supabaseService.auth.signUp({
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
      fullName,
      phoneNumber,
    });

    return {
      user: this.usersService.formatUserResponse(user),
      session: authData.session,
    };
  }

  /**
   * Sign in an existing user
   */
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await this.supabaseService.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new UnauthorizedException(authError.message);
    }

    if (!authData.user) {
      throw new UnauthorizedException('Authentication failed');
    }

    // Find or create user in our database
    const user = await this.usersService.findOrCreate({
      email: authData.user.email!,
      authUserId: authData.user.id,
      fullName: authData.user.user_metadata?.full_name,
      phoneNumber: authData.user.user_metadata?.phone_number,
    });

    // Update last sign in time
    await this.usersService.updateLastSignIn(user.id);

    return {
      user: this.usersService.formatUserResponse(user),
      session: authData.session,
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(accessToken: string) {
    // Set the session for the Supabase client
    const { error } = await this.supabaseService.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Signed out successfully' };
  }

  /**
   * Get user from access token
   */
  async getUserFromToken(accessToken: string) {
    const { data: { user: authUser }, error } = await this.supabaseService.auth.getUser(accessToken);

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

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string) {
    const { error } = await this.supabaseService.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Password reset email sent' };
  }

  /**
   * Update user password
   */
  async updatePassword(accessToken: string, newPassword: string) {
    // First verify the token
    const { data: { user: authUser }, error: userError } = await this.supabaseService.auth.getUser(accessToken);

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
}

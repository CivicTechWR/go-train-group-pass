import {
  SignUpInputDto,
  SignInInputDto,
  PasswordResetInputDto,
  PasswordUpdateInputDto,
  AuthResponseDto,
  UserDto,
} from '@go-train-group-pass/shared';

export interface IAuthService {
  signUp(signUpInput: SignUpInputDto): Promise<void>;
  signIn(signInDto: SignInInputDto): Promise<AuthResponseDto>;
  requestPasswordReset(passwordResetInfo: PasswordResetInputDto): Promise<void>;
  updatePassword(
    accessToken: string,
    passwordUpdateInput: PasswordUpdateInputDto,
  ): Promise<void>;
  resetPassword(recoveryToken: string, newPassword: string): Promise<void>;
  getUserFromToken(token: string): Promise<UserDto>;
  refreshToken(refreshToken: string): Promise<AuthResponseDto>;
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UsersService } from '../../users/users.service';
import { SupabaseService } from './supabase.service';

export interface RequestWithUser extends FastifyRequest {
  user?: ReturnType<UsersService['formatUserResponse']>;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const token = parts[1];

    try {
      // Verify token with Supabase
      const {
        data: { user: authUser },
        error,
      } = await this.supabaseService.auth.getUser(token);

      if (error || !authUser) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Get user from database
      const user = await this.usersService.findByAuthUserId(authUser.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach formatted user data to request for use in controllers
      request.user = this.usersService.formatUserResponse(user);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, AuthGuard],
  exports: [AuthService, SupabaseService, AuthGuard],
})
export class AuthModule {}

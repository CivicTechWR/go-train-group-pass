import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { UsersService } from './users.service';
import { AuthGuard } from './auth.guard';
import { User } from '../entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, UsersService, AuthGuard],
  exports: [AuthService, SupabaseService, UsersService, AuthGuard],
})
export class AuthModule {}

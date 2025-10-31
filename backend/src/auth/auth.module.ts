import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';
import { User } from '../entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, AuthGuard],
  exports: [AuthService, SupabaseService, AuthGuard],
})
export class AuthModule {}

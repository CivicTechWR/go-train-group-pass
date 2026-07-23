import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserRepository } from './users.repository';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}

import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserRepository } from './users.repository';

export interface CreateUserDto {
  email: string;
  authUserId: string;
  name: string;
  phoneNumber: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Create a new user and persist to database
   */
  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    await this.userRepository.getEntityManager().persistAndFlush(user);
    return user;
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOneOrFail(id);
  }

  /**
   * Find a user by their Supabase auth user ID
   */
  async findByAuthUserId(authUserId: string): Promise<User | null> {
    return this.userRepository.findOne({ authUserId });
  }

  /**
   * Find a user by their Supabase auth user ID or throw error
   */
  async findByAuthUserIdOrFail(authUserId: string): Promise<User> {
    return this.userRepository.findOneOrFail({ authUserId });
  }

  /**
   * Update the last sign in timestamp
   */
  async updateLastSignIn(id: string): Promise<void> {
    await this.userRepository.updateLastSignIn(id);
  }

  /**
   * Format user data for API responses
   */
  formatUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    };
  }
}

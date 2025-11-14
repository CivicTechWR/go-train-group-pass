import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from './users.repository';

export interface CreateUserDto extends Partial<User> {
  email: string;
  authUserId: string;
  name: string;
  phoneNumber?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Find a user by their Supabase auth user ID
   */
  async findByAuthUserId(authUserId: string): Promise<User | null> {
    return this.usersRepository.findByAuthUserId(authUserId);
  }

  /**
   * Find or create a user in the database
   * This is used during sign-in when a user exists in Supabase but not in our DB
   */
  async findOrCreate(createUserDto: CreateUserDto): Promise<User> {
    const { authUserId, email, name, phoneNumber } = createUserDto;

    let user = await this.findByAuthUserId(authUserId);

    if (!user) {
      user = this.usersRepository.create({
        email,
        authUserId,
        name,
        phoneNumber,
      });
      await this.usersRepository.getEntityManager().persistAndFlush(user);
    }

    return user;
  }

  /**
   * Create a new user in the database
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, authUserId, name, phoneNumber } = createUserDto;

    const user = this.usersRepository.create({
      email,
      name,
      phoneNumber,
      authUserId,
      lastSignInAt: new Date(),
    });

    await this.usersRepository.getEntityManager().persistAndFlush(user);

    return user;
  }

  /**
   * Update the last sign-in timestamp for a user
   */
  async updateLastSignIn(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.lastSignInAt = new Date();
    await this.usersRepository.getEntityManager().flush();
  }

  /**
   * Get user details by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';

export interface CreateUserDto {
  email: string;
  authUserId: string;
  fullName?: string;
  phoneNumber?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Find a user by their Supabase auth user ID
   */
  async findByAuthUserId(authUserId: string): Promise<User | null> {
    return this.em.findOne(User, { authUserId });
  }

  /**
   * Find or create a user in the database
   * This is used during sign-in when a user exists in Supabase but not in our DB
   */
  async findOrCreate(createUserDto: CreateUserDto): Promise<User> {
    const { authUserId, email, fullName, phoneNumber } = createUserDto;

    let user = await this.findByAuthUserId(authUserId);

    if (!user) {
      user = this.em.create(User, {
        email,
        authUserId,
        fullName,
        phoneNumber,
        isActive: false,
      });
      await this.em.persistAndFlush(user);
    }

    return user;
  }

  /**
   * Create a new user in the database
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, authUserId, fullName, phoneNumber } = createUserDto;

    const user = this.em.create(User, {
      email,
      fullName,
      phoneNumber,
      authUserId,
      lastSignInAt: new Date(),
      createdAt: '',
      updatedAt: '',
      isActive: false,
    });

    await this.em.persistAndFlush(user);

    return user;
  }

  /**
   * Update the last sign-in timestamp for a user
   */
  async updateLastSignIn(userId: string): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.lastSignInAt = new Date();
    await this.em.flush();
  }

  /**
   * Get user details by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  /**
   * Format user data for API responses
   */
  formatUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    };
  }
}

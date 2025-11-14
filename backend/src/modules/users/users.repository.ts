import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository extends EntityRepository<User> {
  async findByAuthUserId(authUserId: string): Promise<User | null> {
    return this.findOne({ authUserId });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ id });
  }
}

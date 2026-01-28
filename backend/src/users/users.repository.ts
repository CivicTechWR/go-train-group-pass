import { EntityRepository } from '@mikro-orm/postgresql'; // or any other driver package
import { User } from '../entities/user.entity';

export class UserRepository extends EntityRepository<User> {
  public async updateLastSignIn(userId: string): Promise<void> {
    const user = await this.findOneOrFail({ id: userId });
    this.assign(user, { lastSignInAt: new Date() });
    return await this.em.persistAndFlush(user);
  }
}

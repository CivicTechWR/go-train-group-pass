import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

import { randomUUID } from 'crypto';
import { BaseEntity } from './base';

@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'string', length: 255 })
  name: string;

  @Property({ type: 'string', length: 255, unique: true })
  email: string;

  @Property({ type: 'string', length: 20, nullable: true })
  phoneNumber?: string;

  @Property({ unique: true, type: 'uuid' })
  authUserId!: string;

  @Property({ nullable: true, type: 'timestamp', onCreate: () => new Date() })
  lastSignInAt?: Date;
}

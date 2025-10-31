import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {

  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ nullable: true })
  fullName?: string;

  @Property({ nullable: true })
  phoneNumber?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ type: 'timestamp', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'timestamp', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true, type: 'timestamp' })
  lastSignInAt?: Date;

  @Property({ onCreate: () => true })
  isActive: boolean = true;

  @Property({ unique: true, type: 'uuid' })
  authUserId!: string;
}

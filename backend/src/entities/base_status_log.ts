import { PrimaryKey, Property, Enum, Entity } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

@Entity({ abstract: true })
export abstract class BaseStatusLog<T extends string> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Enum({ type: 'string' })
  fromState: T;

  @Enum({ type: 'string' })
  toState: T;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}

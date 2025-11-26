import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BaseEntity } from './base';

@Entity()
export class Agency extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  agency_id!: string;

  @Property()
  agencyName!: string;

  @Property()
  agencyUrl!: string;

  @Property()
  agencyTimezone!: string;

  @Property({ nullable: true })
  agencyLang?: string;

  @Property({ nullable: true })
  agencyPhone?: string;
}

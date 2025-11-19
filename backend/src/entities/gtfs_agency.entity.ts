import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from './base';

@Entity()
export class Agency extends BaseEntity {
  @PrimaryKey()
  id!: string;

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

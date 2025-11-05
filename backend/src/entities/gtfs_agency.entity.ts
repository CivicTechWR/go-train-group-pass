import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Agency {
  @PrimaryKey()
  agencyId!: string;

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

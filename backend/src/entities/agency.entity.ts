import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'agency' })
export class Agency {
  @PrimaryKey({ fieldName: 'agency_id' })
  agencyId!: string;

  @Property({ fieldName: 'agency_name' })
  agencyName!: string;

  @Property({ fieldName: 'agency_url' })
  agencyUrl!: string;

  @Property({ fieldName: 'agency_timezone' })
  agencyTimezone!: string;

  @Property({ fieldName: 'agency_lang', nullable: true })
  agencyLang?: string;

  @Property({ fieldName: 'agency_phone', nullable: true })
  agencyPhone?: string;
}
import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BaseEntity } from './base';
import { GTFSFeedInfo } from './gtfs_feed_info.entity';

@Entity()
@Unique({ properties: ['agencyId', 'GTFSFeedInfo'] })
export class Agency extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
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

  @ManyToOne(() => GTFSFeedInfo, { deleteRule: 'cascade' })
  GTFSFeedInfo!: GTFSFeedInfo;
}

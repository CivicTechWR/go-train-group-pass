import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

@Entity({ tableName: 'gtfs_feed_info' })
export class GTFSFeedInfo {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  feedPublisherName!: string;

  @Property()
  feedPublisherUrl!: string;

  @Property()
  feedLang!: string;

  @Property()
  feedStartDate!: Date;

  @Property()
  feedEndDate!: Date;

  @Property()
  feedVersion!: string;
}

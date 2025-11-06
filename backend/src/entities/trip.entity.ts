import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { BaseEntity } from './base';

@Entity()
export class Trip extends BaseEntity {

  @PrimaryKey()
  id: string = randomUUID();

  @Property({ fieldName: 'start_stop' })
  startStop!: string;

  @Property({ fieldName: 'end_stop' })
  endStop!: string;

  @Property()
  startTime!: Date;

  @Property()
  endTime!: Date;

}

import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Calendar {
  @PrimaryKey()
  serviceId!: string;

  @Property({ type: 'boolean' })
  monday!: boolean;

  @Property({ type: 'boolean' })
  tuesday!: boolean;

  @Property({ type: 'boolean' })
  wednesday!: boolean;

  @Property({ type: 'boolean' })
  thursday!: boolean;

  @Property({ type: 'boolean' })
  friday!: boolean;

  @Property({ type: 'boolean' })
  saturday!: boolean;

  @Property({ type: 'boolean' })
  sunday!: boolean;

  @Property({ type: 'date' })
  startDate!: Date;

  @Property({ type: 'date' })
  endDate!: Date;
}

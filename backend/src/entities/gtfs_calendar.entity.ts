import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Calendar {
  @PrimaryKey({ fieldName: 'service_id' })
  serviceId!: string;

  @Property({ fieldName: 'monday', type: 'boolean' })
  monday!: boolean;

  @Property({ fieldName: 'tuesday', type: 'boolean' })
  tuesday!: boolean;

  @Property({ fieldName: 'wednesday', type: 'boolean' })
  wednesday!: boolean;

  @Property({ fieldName: 'thursday', type: 'boolean' })
  thursday!: boolean;

  @Property({ fieldName: 'friday', type: 'boolean' })
  friday!: boolean;

  @Property({ fieldName: 'saturday', type: 'boolean' })
  saturday!: boolean;

  @Property({ fieldName: 'sunday', type: 'boolean' })
  sunday!: boolean;

  @Property({ fieldName: 'start_date', type: 'date' })
  startDate!: Date;

  @Property({ fieldName: 'end_date', type: 'date' })
  endDate!: Date;
}

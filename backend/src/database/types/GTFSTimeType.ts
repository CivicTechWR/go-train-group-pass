import { Type } from '@mikro-orm/core';
import { GTFSTimeString, isGtfsTimeString } from '../../utils/isGTFSTimeString';

export class GTFSTimeType extends Type<GTFSTimeString, string> {
  convertToJSValue(value: string): GTFSTimeString {
    if (!isGtfsTimeString(value)) {
      throw new Error(`Invalid GtfsTimeString "${value}" read from database.`);
    }
    return value;
  }

  convertToDatabaseValue(value: GTFSTimeString): string {
    return value;
  }

  getColumnType(): string {
    return 'varchar(8)';
  }
}

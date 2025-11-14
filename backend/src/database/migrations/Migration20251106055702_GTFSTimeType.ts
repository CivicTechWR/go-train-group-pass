import { Migration } from '@mikro-orm/migrations';

export class Migration20251106055702_GTFSTimeType extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "go-train-group-pass"."gtfs_stop_times" alter column "arrival_time" type GTFSTimeType using ("arrival_time"::GTFSTimeType);`,
    );
    this.addSql(
      `alter table "go-train-group-pass"."gtfs_stop_times" alter column "departure_time" type GTFSTimeType using ("departure_time"::GTFSTimeType);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "go-train-group-pass"."gtfs_stop_times" alter column "arrival_time" type varchar(255) using ("arrival_time"::varchar(255));`,
    );
    this.addSql(
      `alter table "go-train-group-pass"."gtfs_stop_times" alter column "departure_time" type varchar(255) using ("departure_time"::varchar(255));`,
    );
  }
}

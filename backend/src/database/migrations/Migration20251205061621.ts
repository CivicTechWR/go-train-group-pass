import { Migration } from '@mikro-orm/migrations';

export class Migration20251205061621 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."agency" drop constraint "agency_feed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."agency" drop constraint "agency_agency_id_feed_info_id_unique";`);

    this.addSql(`alter table "go-train-group-pass"."agency" rename column "feed_info_id" to "gtfsfeed_info_id";`);
    this.addSql(`alter table "go-train-group-pass"."agency" add constraint "agency_gtfsfeed_info_id_foreign" foreign key ("gtfsfeed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "go-train-group-pass"."agency" add constraint "agency_agency_id_gtfsfeed_info_id_unique" unique ("agency_id", "gtfsfeed_info_id");`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" drop constraint "gtfs_stop_times_trip_id_arrival_time_departure_ti_dfcdb_unique";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_trip_id_stop_sequence_gtfsfeed_info_id_unique" unique ("trip_id", "stop_sequence", "gtfsfeed_info_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."agency" drop constraint "agency_gtfsfeed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."agency" drop constraint "agency_agency_id_gtfsfeed_info_id_unique";`);

    this.addSql(`alter table "go-train-group-pass"."agency" rename column "gtfsfeed_info_id" to "feed_info_id";`);
    this.addSql(`alter table "go-train-group-pass"."agency" add constraint "agency_feed_info_id_foreign" foreign key ("feed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "go-train-group-pass"."agency" add constraint "agency_agency_id_feed_info_id_unique" unique ("agency_id", "feed_info_id");`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" drop constraint "gtfs_stop_times_trip_id_stop_sequence_gtfsfeed_info_id_unique";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_trip_id_arrival_time_departure_ti_dfcdb_unique" unique ("trip_id", "arrival_time", "departure_time", "stop_id", "gtfsfeed_info_id");`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20251207013049 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."trip" drop constraint "trip_gtfs_trip_id_origin_stop_time_id_destination_59c37_unique";`);

    this.addSql(`alter table "go-train-group-pass"."trip" add column "date" date not null, add column "origin_stop_name" varchar(255) not null, add column "destination_stop_name" varchar(255) not null, add column "route_short_name" varchar(255) not null, add column "route_long_name" varchar(255) not null, add column "departure_time" timestamptz not null, add column "arrival_time" timestamptz not null;`);
    this.addSql(`alter table "go-train-group-pass"."trip" add constraint "trip_gtfs_trip_id_origin_stop_time_id_destination_e592d_unique" unique ("gtfs_trip_id", "origin_stop_time_id", "destination_stop_time_id", "date");`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" drop constraint "itinerary_user_id_itinerary_hash_unique";`);
    this.addSql(`alter table "go-train-group-pass"."itinerary" drop column "itinerary_hash";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."trip" drop constraint "trip_gtfs_trip_id_origin_stop_time_id_destination_e592d_unique";`);
    this.addSql(`alter table "go-train-group-pass"."trip" drop column "date", drop column "origin_stop_name", drop column "destination_stop_name", drop column "route_short_name", drop column "route_long_name", drop column "departure_time", drop column "arrival_time";`);

    this.addSql(`alter table "go-train-group-pass"."trip" add constraint "trip_gtfs_trip_id_origin_stop_time_id_destination_59c37_unique" unique ("gtfs_trip_id", "origin_stop_time_id", "destination_stop_time_id");`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" add column "itinerary_hash" varchar(255) not null;`);
    this.addSql(`alter table "go-train-group-pass"."itinerary" add constraint "itinerary_user_id_itinerary_hash_unique" unique ("user_id", "itinerary_hash");`);
  }

}

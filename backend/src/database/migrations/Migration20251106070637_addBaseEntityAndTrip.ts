import { Migration } from '@mikro-orm/migrations';

export class Migration20251106070637_addBaseEntityAndTrip extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "go-train-group-pass"."trip" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "start_stop" varchar(255) not null, "end_stop" varchar(255) not null, "start_time" timestamptz not null, "end_time" timestamptz not null, constraint "trip_pkey" primary key ("id"));`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."agency" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_calendar_dates" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_routes" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stops" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" alter column "calendar_date_date" type date using ("calendar_date_date"::date);`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign" foreign key ("calendar_date_service_id", "calendar_date_date") references "go-train-group-pass"."gtfs_calendar_dates" ("service_id", "date") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "go-train-group-pass"."trip" cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."agency" drop column "created_at", drop column "updated_at";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_calendar_dates" drop column "created_at", drop column "updated_at";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_routes" drop column "created_at", drop column "updated_at";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" drop column "created_at", drop column "updated_at";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stops" drop column "created_at", drop column "updated_at";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop column "created_at", drop column "updated_at";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" alter column "calendar_date_date" type date using ("calendar_date_date"::date);`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign" foreign key ("calendar_date_service_id", "calendar_date_date") references "go-train-group-pass"."gtfs_calendar_dates" ("service_id", "date") on update cascade on delete no action;`);
  }

}

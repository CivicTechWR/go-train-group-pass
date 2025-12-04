import { Migration } from '@mikro-orm/migrations';

export class Migration20251203045018 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create schema if not exists "go-train-group-pass";`);
    this.addSql(`create table "go-train-group-pass"."agency" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "agency_id" varchar(255) not null, "agency_name" varchar(255) not null, "agency_url" varchar(255) not null, "agency_timezone" varchar(255) not null, "agency_lang" varchar(255) null, "agency_phone" varchar(255) null, constraint "agency_pkey" primary key ("id"));`);

    this.addSql(`create table "go-train-group-pass"."gtfs_feed_info" ("id" uuid not null default gen_random_uuid(), "feed_publisher_name" varchar(255) not null, "feed_publisher_url" varchar(255) not null, "feed_lang" varchar(255) not null, "feed_start_date" timestamptz not null, "feed_end_date" timestamptz not null, "feed_version" varchar(255) not null, constraint "gtfs_feed_info_pkey" primary key ("id"));`);

    this.addSql(`create table "go-train-group-pass"."gtfs_calendar_dates" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "service_id" varchar(255) not null, "date" date not null, "exception_type" int not null, "gtfsfeed_info_id" uuid not null, constraint "gtfs_calendar_dates_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_calendar_dates_date" on "go-train-group-pass"."gtfs_calendar_dates" ("date");`);

    this.addSql(`create table "go-train-group-pass"."gtfs_routes" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "route_id" varchar(255) not null, "route_short_name" varchar(255) not null, "route_long_name" varchar(255) not null, "route_desc" varchar(255) null, "route_type" int not null, "route_url" varchar(255) null, "route_color" varchar(255) null, "route_text_color" varchar(255) null, "agency_id" uuid null, "gtfsfeed_info_id" uuid not null, constraint "gtfs_routes_pkey" primary key ("id"));`);

    this.addSql(`create table "go-train-group-pass"."gtfs_stops" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "stopid" varchar(255) not null, "stop_name" varchar(255) not null, "stop_desc" varchar(255) null, "stop_lat" numeric(10,6) not null, "stop_lon" numeric(10,6) not null, "zone_id" varchar(255) null, "stop_url" varchar(255) null, "location_type" int null, "parent_station" varchar(255) null, "wheelchair_boarding" int null, "gtfsfeed_info_id" uuid not null, constraint "gtfs_stops_pkey" primary key ("id"));`);

    this.addSql(`create table "go-train-group-pass"."gtfs_trips" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "trip_id" varchar(255) not null, "calendar_date_id" uuid not null, "trip_headsign" varchar(255) null, "trip_short_name" varchar(255) null, "direction_id" int null, "block_id" varchar(255) null, "shape_id" varchar(255) null, "wheelchair_accessible" int null, "bikes_allowed" int null, "route_id" uuid not null, "gtfsfeed_info_id" uuid not null, constraint "gtfs_trips_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_trips_calendar_date" on "go-train-group-pass"."gtfs_trips" ("calendar_date_id");`);
    this.addSql(`create index "idx_trips_route" on "go-train-group-pass"."gtfs_trips" ("route_id");`);

    this.addSql(`create table "go-train-group-pass"."gtfs_stop_times" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "stop_time_id" varchar(255) not null, "stop_sequence" int not null, "arrival_time" varchar(8) not null, "departure_time" varchar(8) not null, "stop_headsign" varchar(255) null, "pickup_type" int null, "drop_off_type" int null, "shape_dist_traveled" numeric(10,0) null, "timepoint" int null, "stop_id" uuid not null, "trip_id" uuid not null, "gtfsfeed_info_id" uuid not null, constraint "gtfs_stop_times_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_stop_times_stop_departure" on "go-train-group-pass"."gtfs_stop_times" ("stop_id", "departure_time");`);
    this.addSql(`create index "idx_stop_times_stop" on "go-train-group-pass"."gtfs_stop_times" ("stop_id");`);

    this.addSql(`create table "go-train-group-pass"."users" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "phone_number" varchar(20) null, "auth_user_id" uuid not null, "last_sign_in_at" timestamptz null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "go-train-group-pass"."users" add constraint "users_email_unique" unique ("email");`);
    this.addSql(`alter table "go-train-group-pass"."users" add constraint "users_auth_user_id_unique" unique ("auth_user_id");`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_calendar_dates" add constraint "gtfs_calendar_dates_gtfsfeed_info_id_foreign" foreign key ("gtfsfeed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_routes" add constraint "gtfs_routes_agency_id_foreign" foreign key ("agency_id") references "go-train-group-pass"."agency" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_routes" add constraint "gtfs_routes_gtfsfeed_info_id_foreign" foreign key ("gtfsfeed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stops" add constraint "gtfs_stops_gtfsfeed_info_id_foreign" foreign key ("gtfsfeed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_id_foreign" foreign key ("calendar_date_id") references "go-train-group-pass"."gtfs_calendar_dates" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_route_id_foreign" foreign key ("route_id") references "go-train-group-pass"."gtfs_routes" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_gtfsfeed_info_id_foreign" foreign key ("gtfsfeed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_stop_id_foreign" foreign key ("stop_id") references "go-train-group-pass"."gtfs_stops" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_trip_id_foreign" foreign key ("trip_id") references "go-train-group-pass"."gtfs_trips" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_gtfsfeed_info_id_foreign" foreign key ("gtfsfeed_info_id") references "go-train-group-pass"."gtfs_feed_info" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."gtfs_routes" drop constraint "gtfs_routes_agency_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_calendar_dates" drop constraint "gtfs_calendar_dates_gtfsfeed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_routes" drop constraint "gtfs_routes_gtfsfeed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stops" drop constraint "gtfs_stops_gtfsfeed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_gtfsfeed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" drop constraint "gtfs_stop_times_gtfsfeed_info_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_calendar_date_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_route_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" drop constraint "gtfs_stop_times_stop_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_stop_times" drop constraint "gtfs_stop_times_trip_id_foreign";`);

    this.addSql(`drop table if exists "go-train-group-pass"."agency" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."gtfs_feed_info" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."gtfs_calendar_dates" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."gtfs_routes" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."gtfs_stops" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."gtfs_trips" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."gtfs_stop_times" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."users" cascade;`);

    this.addSql(`drop schema if exists "go-train-group-pass";`);
  }

}

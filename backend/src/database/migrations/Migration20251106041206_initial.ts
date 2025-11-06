import { Migration } from '@mikro-orm/migrations';

export class Migration20251106041206 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create schema if not exists "go-train-group-pass";`);
    this.addSql(
      `create table "go-train-group-pass"."agency" ("agency_id" varchar(255) not null, "agency_name" varchar(255) not null, "agency_url" varchar(255) not null, "agency_timezone" varchar(255) not null, "agency_lang" varchar(255) null, "agency_phone" varchar(255) null, constraint "agency_pkey" primary key ("agency_id"));`,
    );

    this.addSql(
      `create table "go-train-group-pass"."gtfs_calendar_dates" ("service_id" varchar(255) not null, "date" date not null, "exception_type" int not null, constraint "gtfs_calendar_dates_pkey" primary key ("service_id", "date"));`,
    );
    this.addSql(
      `create index "idx_calendar_dates_date" on "go-train-group-pass"."gtfs_calendar_dates" ("date");`,
    );

    this.addSql(
      `create table "go-train-group-pass"."gtfs_routes" ("route_id" varchar(255) not null, "route_short_name" varchar(255) not null, "route_long_name" varchar(255) not null, "route_desc" varchar(255) null, "route_type" int not null, "route_url" varchar(255) null, "route_color" varchar(255) null, "route_text_color" varchar(255) null, "agency_agency_id" varchar(255) null, constraint "gtfs_routes_pkey" primary key ("route_id"));`,
    );

    this.addSql(
      `create table "go-train-group-pass"."gtfs_stops" ("stop_id" varchar(255) not null, "stop_name" varchar(255) not null, "stop_desc" varchar(255) null, "stop_lat" numeric(10,6) not null, "stop_lon" numeric(10,6) not null, "zone_id" varchar(255) null, "stop_url" varchar(255) null, "location_type" int null, "parent_station" varchar(255) null, "wheelchair_boarding" int null, constraint "gtfs_stops_pkey" primary key ("stop_id"));`,
    );

    this.addSql(
      `create table "go-train-group-pass"."gtfs_trips" ("trip_id" varchar(255) not null, "calendar_date_service_id" varchar(255) not null, "calendar_date_date" date not null, "trip_headsign" varchar(255) null, "trip_short_name" varchar(255) null, "direction_id" int null, "block_id" varchar(255) null, "shape_id" varchar(255) null, "wheelchair_accessible" int null, "bikes_allowed" int null, "route_route_id" varchar(255) not null, constraint "gtfs_trips_pkey" primary key ("trip_id"));`,
    );
    this.addSql(
      `create index "idx_trips_calendar_date" on "go-train-group-pass"."gtfs_trips" ("calendar_date_service_id", "calendar_date_date");`,
    );
    this.addSql(
      `create index "idx_trips_route" on "go-train-group-pass"."gtfs_trips" ("route_route_id");`,
    );

    this.addSql(
      `create table "go-train-group-pass"."gtfs_stop_times" ("trip_id" varchar(255) not null, "stop_sequence" int not null, "arrival_time" varchar(255) not null, "departure_time" varchar(255) not null, "stop_headsign" varchar(255) null, "pickup_type" int null, "drop_off_type" int null, "shape_dist_traveled" numeric(10,0) null, "timepoint" int null, "stop_stop_id" varchar(255) not null, "trip_trip_id" varchar(255) not null, constraint "gtfs_stop_times_pkey" primary key ("trip_id", "stop_sequence"));`,
    );
    this.addSql(
      `create index "idx_stop_times_stop_departure" on "go-train-group-pass"."gtfs_stop_times" ("stop_stop_id", "departure_time");`,
    );
    this.addSql(
      `create index "idx_stop_times_stop" on "go-train-group-pass"."gtfs_stop_times" ("stop_stop_id");`,
    );

    this.addSql(
      `create table "go-train-group-pass"."users" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "full_name" varchar(255) null, "phone_number" varchar(255) null, "avatar_url" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "last_sign_in_at" timestamptz null, "is_active" boolean not null default true, "auth_user_id" uuid not null, constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "go-train-group-pass"."users" add constraint "users_email_unique" unique ("email");`,
    );
    this.addSql(
      `alter table "go-train-group-pass"."users" add constraint "users_auth_user_id_unique" unique ("auth_user_id");`,
    );

    this.addSql(
      `alter table "go-train-group-pass"."gtfs_routes" add constraint "gtfs_routes_agency_agency_id_foreign" foreign key ("agency_agency_id") references "go-train-group-pass"."agency" ("agency_id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign" foreign key ("calendar_date_service_id", "calendar_date_date") references "go-train-group-pass"."gtfs_calendar_dates" ("service_id", "date") on update cascade;`,
    );
    this.addSql(
      `alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_route_route_id_foreign" foreign key ("route_route_id") references "go-train-group-pass"."gtfs_routes" ("route_id") on update cascade;`,
    );

    this.addSql(
      `alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_stop_stop_id_foreign" foreign key ("stop_stop_id") references "go-train-group-pass"."gtfs_stops" ("stop_id") on update cascade;`,
    );
    this.addSql(
      `alter table "go-train-group-pass"."gtfs_stop_times" add constraint "gtfs_stop_times_trip_trip_id_foreign" foreign key ("trip_trip_id") references "go-train-group-pass"."gtfs_trips" ("trip_id") on update cascade;`,
    );
  }
}

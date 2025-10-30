import { Migration } from '@mikro-orm/migrations';

export class Migration20251030210056 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "agency" ("agency_id" varchar(255) not null, "agency_name" varchar(255) not null, "agency_url" varchar(255) not null, "agency_timezone" varchar(255) not null, "agency_lang" varchar(255) null, "agency_phone" varchar(255) null, constraint "agency_pkey" primary key ("agency_id"));`);

    this.addSql(`create table "calendar" ("service_id" varchar(255) not null, "monday" boolean not null, "tuesday" boolean not null, "wednesday" boolean not null, "thursday" boolean not null, "friday" boolean not null, "saturday" boolean not null, "sunday" boolean not null, "start_date" date not null, "end_date" date not null, constraint "calendar_pkey" primary key ("service_id"));`);

    this.addSql(`create table "calendar_dates" ("service_id" varchar(255) not null, "date" date not null, "exception_type" int not null, constraint "calendar_dates_pkey" primary key ("service_id", "date"));`);
    this.addSql(`create index "idx_calendar_dates_date" on "calendar_dates" ("date");`);

    this.addSql(`create table "routes" ("route_id" varchar(255) not null, "agency_id" varchar(255) null, "route_short_name" varchar(255) not null, "route_long_name" varchar(255) not null, "route_desc" varchar(255) null, "route_type" int not null, "route_url" varchar(255) null, "route_color" varchar(255) null, "route_text_color" varchar(255) null, constraint "routes_pkey" primary key ("route_id"));`);

    this.addSql(`create table "stops" ("stop_id" varchar(255) not null, "stop_name" varchar(255) not null, "stop_desc" varchar(255) null, "stop_lat" numeric(10,6) not null, "stop_lon" numeric(10,6) not null, "zone_id" varchar(255) null, "stop_url" varchar(255) null, "location_type" int null, "parent_station" varchar(255) null, "wheelchair_boarding" int null, constraint "stops_pkey" primary key ("stop_id"));`);

    this.addSql(`create table "trips" ("trip_id" varchar(255) not null, "route_id" varchar(255) not null, "service_id" varchar(255) not null, "trip_headsign" varchar(255) null, "trip_short_name" varchar(255) null, "direction_id" int null, "block_id" varchar(255) null, "shape_id" varchar(255) null, "wheelchair_accessible" int null, "bikes_allowed" int null, "route_route_id" varchar(255) not null, constraint "trips_pkey" primary key ("trip_id"));`);
    this.addSql(`create index "idx_trips_service" on "trips" ("service_id");`);
    this.addSql(`create index "idx_trips_route" on "trips" ("route_id");`);

    this.addSql(`create table "stop_times" ("trip_id" varchar(255) not null, "stop_sequence" int not null, "stop_id" varchar(255) not null, "arrival_time" varchar(255) not null, "departure_time" varchar(255) not null, "stop_headsign" varchar(255) null, "pickup_type" int null, "drop_off_type" int null, "shape_dist_traveled" numeric(10,0) null, "timepoint" int null, "trip_trip_id" varchar(255) not null, "stop_stop_id" varchar(255) not null, constraint "stop_times_pkey" primary key ("trip_id", "stop_sequence"));`);
    this.addSql(`create index "idx_stop_times_stop_departure" on "stop_times" ("stop_id", "departure_time");`);
    this.addSql(`create index "idx_stop_times_stop" on "stop_times" ("stop_id");`);

    this.addSql(`alter table "trips" add constraint "trips_route_route_id_foreign" foreign key ("route_route_id") references "routes" ("route_id") on update cascade;`);

    this.addSql(`alter table "stop_times" add constraint "stop_times_trip_trip_id_foreign" foreign key ("trip_trip_id") references "trips" ("trip_id") on update cascade;`);
    this.addSql(`alter table "stop_times" add constraint "stop_times_stop_stop_id_foreign" foreign key ("stop_stop_id") references "stops" ("stop_id") on update cascade;`);
  }

}

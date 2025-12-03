import { Migration } from '@mikro-orm/migrations';

export class Migration20251203063911 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "go-train-group-pass"."trip" ("id" uuid not null default gen_random_uuid(), "gtfs_trip_id" uuid not null, "origin_stop_time_id" uuid not null, "destination_stop_time_id" uuid not null, constraint "trip_pkey" primary key ("id"));`);
    this.addSql(`alter table "go-train-group-pass"."trip" add constraint "trip_gtfs_trip_id_origin_stop_time_id_destination_59c37_unique" unique ("gtfs_trip_id", "origin_stop_time_id", "destination_stop_time_id");`);

    this.addSql(`create table "go-train-group-pass"."travel_group" ("id" uuid not null default gen_random_uuid(), "group_number" int not null, "finalized_at" timestamptz null, "status" text check ("status" in ('forming', 'finalized', 'departed', 'completed')) not null default 'forming', "created_at" timestamptz not null, "updated_at" timestamptz not null, "trip_id" uuid not null, "steward_id" uuid not null, constraint "travel_group_pkey" primary key ("id"));`);
    this.addSql(`create index "travel_group_trip_id_index" on "go-train-group-pass"."travel_group" ("trip_id");`);
    this.addSql(`create index "travel_group_steward_id_index" on "go-train-group-pass"."travel_group" ("steward_id");`);

    this.addSql(`create table "go-train-group-pass"."travel_group_status_log" ("id" uuid not null default gen_random_uuid(), "from_state" smallint not null, "to_state" smallint not null, "created_at" timestamptz not null, "travel_group_id" uuid not null, constraint "travel_group_status_log_pkey" primary key ("id"));`);

    this.addSql(`create table "go-train-group-pass"."itinerary" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "status" text check ("status" in ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')) not null default 'draft', "wants_to_steward" boolean not null default false, "user_id" uuid not null, constraint "itinerary_pkey" primary key ("id"));`);
    this.addSql(`create index "itinerary_user_id_index" on "go-train-group-pass"."itinerary" ("user_id");`);

    this.addSql(`create table "go-train-group-pass"."trip_booking" ("id" uuid not null default gen_random_uuid(), "sequence" int null, "checked_in_at" timestamptz null, "status" text check ("status" in ('pending', 'checked_in', 'grouped', 'completed', 'no_show')) not null default 'pending', "is_confirmed_by_steward" boolean not null default false, "confirmed_at" timestamptz null, "member_present" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "itinerary_id" uuid null, "trip_id" uuid not null, "group_id" uuid null, constraint "trip_booking_pkey" primary key ("id"));`);
    this.addSql(`create index "trip_booking_user_id_index" on "go-train-group-pass"."trip_booking" ("user_id");`);
    this.addSql(`create index "trip_booking_itinerary_id_index" on "go-train-group-pass"."trip_booking" ("itinerary_id");`);
    this.addSql(`create index "trip_booking_trip_id_index" on "go-train-group-pass"."trip_booking" ("trip_id");`);
    this.addSql(`create index "trip_booking_group_id_index" on "go-train-group-pass"."trip_booking" ("group_id");`);

    this.addSql(`create table "go-train-group-pass"."trip_booking_status_log" ("id" uuid not null default gen_random_uuid(), "from_state" smallint not null, "to_state" smallint not null, "created_at" timestamptz not null, "trip_booking_id" uuid not null, constraint "trip_booking_status_log_pkey" primary key ("id"));`);

    this.addSql(`create table "go-train-group-pass"."ticket_purchase" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "total_amount" numeric(10,2) not null, "group_size" int not null, "purchased_at" timestamptz not null, "ticket_image_url" varchar(500) null, "group_id" uuid not null, "steward_trip_booking_id" uuid not null, constraint "ticket_purchase_pkey" primary key ("id"));`);
    this.addSql(`create index "ticket_purchase_group_id_index" on "go-train-group-pass"."ticket_purchase" ("group_id");`);
    this.addSql(`create index "ticket_purchase_steward_trip_booking_id_index" on "go-train-group-pass"."ticket_purchase" ("steward_trip_booking_id");`);

    this.addSql(`create table "go-train-group-pass"."payment" ("id" uuid not null default gen_random_uuid(), "amount_owed" numeric(10,2) not null, "is_paid" boolean not null default false, "marked_paid_at" timestamptz null, "trip_booking_id" uuid not null, "ticket_purchase_id" uuid null, "marked_paid_by_id" uuid null, "paid_by_user_id" uuid null, constraint "payment_pkey" primary key ("id"));`);
    this.addSql(`create index "payment_trip_booking_id_index" on "go-train-group-pass"."payment" ("trip_booking_id");`);
    this.addSql(`create index "payment_ticket_purchase_id_index" on "go-train-group-pass"."payment" ("ticket_purchase_id");`);
    this.addSql(`create index "payment_marked_paid_by_id_index" on "go-train-group-pass"."payment" ("marked_paid_by_id");`);
    this.addSql(`create index "payment_paid_by_user_id_index" on "go-train-group-pass"."payment" ("paid_by_user_id");`);

    this.addSql(`create table "go-train-group-pass"."payment_calculation" ("id" uuid not null default gen_random_uuid(), "calculation_version" varchar(50) not null, "total_ticket_cost" numeric(10,2) not null, "group_size" int not null, "base_amount" numeric(10,2) null, "payment_id" uuid not null, constraint "payment_calculation_pkey" primary key ("id"));`);
    this.addSql(`alter table "go-train-group-pass"."payment_calculation" add constraint "payment_calculation_payment_id_unique" unique ("payment_id");`);

    this.addSql(`create table "go-train-group-pass"."itinerary_status_log" ("id" uuid not null default gen_random_uuid(), "from_state" smallint not null, "to_state" smallint not null, "created_at" timestamptz not null, "itineraryId" uuid not null, constraint "itinerary_status_log_pkey" primary key ("id"));`);
    this.addSql(`create index "itinerary_status_log_itineraryId_index" on "go-train-group-pass"."itinerary_status_log" ("itineraryId");`);

    this.addSql(`alter table "go-train-group-pass"."trip" add constraint "trip_gtfs_trip_id_foreign" foreign key ("gtfs_trip_id") references "go-train-group-pass"."gtfs_trips" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."trip" add constraint "trip_origin_stop_time_id_foreign" foreign key ("origin_stop_time_id") references "go-train-group-pass"."gtfs_stop_times" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."trip" add constraint "trip_destination_stop_time_id_foreign" foreign key ("destination_stop_time_id") references "go-train-group-pass"."gtfs_stop_times" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."travel_group" add constraint "travel_group_trip_id_foreign" foreign key ("trip_id") references "go-train-group-pass"."trip" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."travel_group" add constraint "travel_group_steward_id_foreign" foreign key ("steward_id") references "go-train-group-pass"."users" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."travel_group_status_log" add constraint "travel_group_status_log_travel_group_id_foreign" foreign key ("travel_group_id") references "go-train-group-pass"."travel_group" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" add constraint "itinerary_user_id_foreign" foreign key ("user_id") references "go-train-group-pass"."users" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_user_id_foreign" foreign key ("user_id") references "go-train-group-pass"."users" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_itinerary_id_foreign" foreign key ("itinerary_id") references "go-train-group-pass"."itinerary" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_trip_id_foreign" foreign key ("trip_id") references "go-train-group-pass"."trip" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_group_id_foreign" foreign key ("group_id") references "go-train-group-pass"."travel_group" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking_status_log" add constraint "trip_booking_status_log_trip_booking_id_foreign" foreign key ("trip_booking_id") references "go-train-group-pass"."trip_booking" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."ticket_purchase" add constraint "ticket_purchase_group_id_foreign" foreign key ("group_id") references "go-train-group-pass"."travel_group" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."ticket_purchase" add constraint "ticket_purchase_steward_trip_booking_id_foreign" foreign key ("steward_trip_booking_id") references "go-train-group-pass"."trip_booking" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_trip_booking_id_foreign" foreign key ("trip_booking_id") references "go-train-group-pass"."trip_booking" ("id") on update cascade;`);
    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_ticket_purchase_id_foreign" foreign key ("ticket_purchase_id") references "go-train-group-pass"."ticket_purchase" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_marked_paid_by_id_foreign" foreign key ("marked_paid_by_id") references "go-train-group-pass"."users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_paid_by_user_id_foreign" foreign key ("paid_by_user_id") references "go-train-group-pass"."users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "go-train-group-pass"."payment_calculation" add constraint "payment_calculation_payment_id_foreign" foreign key ("payment_id") references "go-train-group-pass"."payment" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."itinerary_status_log" add constraint "itinerary_status_log_itineraryId_foreign" foreign key ("itineraryId") references "go-train-group-pass"."itinerary" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_calendar_date_id_foreign";`);

    this.addSql(`drop index "go-train-group-pass"."idx_trips_calendar_date";`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop column "calendar_date_id";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add column "service_id" varchar(255) not null;`);
    this.addSql(`create index "idx_trips_service_id" on "go-train-group-pass"."gtfs_trips" ("service_id");`);

    this.addSql(`alter table "go-train-group-pass"."users" alter column "phone_number" type varchar(20) using ("phone_number"::varchar(20));`);
    this.addSql(`alter table "go-train-group-pass"."users" alter column "phone_number" set not null;`);
    this.addSql(`alter table "go-train-group-pass"."users" add constraint "users_phone_number_unique" unique ("phone_number");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."travel_group" drop constraint "travel_group_trip_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" drop constraint "trip_booking_trip_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."travel_group_status_log" drop constraint "travel_group_status_log_travel_group_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" drop constraint "trip_booking_group_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."ticket_purchase" drop constraint "ticket_purchase_group_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" drop constraint "trip_booking_itinerary_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."itinerary_status_log" drop constraint "itinerary_status_log_itineraryId_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking_status_log" drop constraint "trip_booking_status_log_trip_booking_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."ticket_purchase" drop constraint "ticket_purchase_steward_trip_booking_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."payment" drop constraint "payment_trip_booking_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."payment" drop constraint "payment_ticket_purchase_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."payment_calculation" drop constraint "payment_calculation_payment_id_foreign";`);

    this.addSql(`drop table if exists "go-train-group-pass"."trip" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."travel_group" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."travel_group_status_log" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."itinerary" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."trip_booking" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."trip_booking_status_log" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."ticket_purchase" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."payment" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."payment_calculation" cascade;`);

    this.addSql(`drop table if exists "go-train-group-pass"."itinerary_status_log" cascade;`);

    this.addSql(`drop index "go-train-group-pass"."idx_trips_service_id";`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop column "service_id";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add column "calendar_date_id" uuid not null;`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_id_foreign" foreign key ("calendar_date_id") references "go-train-group-pass"."gtfs_calendar_dates" ("id") on update cascade on delete no action;`);
    this.addSql(`create index "idx_trips_calendar_date" on "go-train-group-pass"."gtfs_trips" ("calendar_date_id");`);

    this.addSql(`alter table "go-train-group-pass"."users" drop constraint "users_phone_number_unique";`);

    this.addSql(`alter table "go-train-group-pass"."users" alter column "phone_number" type varchar(20) using ("phone_number"::varchar(20));`);
    this.addSql(`alter table "go-train-group-pass"."users" alter column "phone_number" drop not null;`);
  }

}

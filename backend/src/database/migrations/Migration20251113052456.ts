import { Migration } from '@mikro-orm/migrations';

export class Migration20251113052456 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."travel_group" drop constraint "travel_group_steward_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" drop constraint "itinerary_user_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" drop constraint "trip_booking_user_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."payment" drop constraint "payment_marked_paid_by_id_foreign";`);
    this.addSql(`alter table "go-train-group-pass"."payment" drop constraint "payment_paid_by_user_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" alter column "calendar_date_date" type date using ("calendar_date_date"::date);`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign" foreign key ("calendar_date_service_id", "calendar_date_date") references "go-train-group-pass"."gtfs_calendar_dates" ("service_id", "date") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."users" drop column "full_name", drop column "avatar_url", drop column "is_active";`);

    this.addSql(`alter table "go-train-group-pass"."users" add column "name" varchar(255) not null;`);
    this.addSql(`alter table "go-train-group-pass"."users" alter column "phone_number" type varchar(20) using ("phone_number"::varchar(20));`);

    this.addSql(`alter table "go-train-group-pass"."travel_group" add constraint "travel_group_steward_id_foreign" foreign key ("steward_id") references "go-train-group-pass"."users" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" add constraint "itinerary_user_id_foreign" foreign key ("user_id") references "go-train-group-pass"."users" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_user_id_foreign" foreign key ("user_id") references "go-train-group-pass"."users" ("id") on update cascade;`);

    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_marked_paid_by_id_foreign" foreign key ("marked_paid_by_id") references "go-train-group-pass"."users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_paid_by_user_id_foreign" foreign key ("paid_by_user_id") references "go-train-group-pass"."users" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" drop constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" drop constraint "itinerary_user_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."payment" drop constraint "payment_marked_paid_by_id_foreign";`);
    this.addSql(`alter table "go-train-group-pass"."payment" drop constraint "payment_paid_by_user_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."travel_group" drop constraint "travel_group_steward_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" drop constraint "trip_booking_user_id_foreign";`);

    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" alter column "calendar_date_date" type date using ("calendar_date_date"::date);`);
    this.addSql(`alter table "go-train-group-pass"."gtfs_trips" add constraint "gtfs_trips_calendar_date_service_id_calendar_date_date_foreign" foreign key ("calendar_date_service_id", "calendar_date_date") references "go-train-group-pass"."gtfs_calendar_dates" ("service_id", "date") on update cascade on delete no action;`);

    this.addSql(`alter table "go-train-group-pass"."itinerary" add constraint "itinerary_user_id_foreign" foreign key ("user_id") references "go-train-group-pass"."user" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_marked_paid_by_id_foreign" foreign key ("marked_paid_by_id") references "go-train-group-pass"."user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "go-train-group-pass"."payment" add constraint "payment_paid_by_user_id_foreign" foreign key ("paid_by_user_id") references "go-train-group-pass"."user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "go-train-group-pass"."travel_group" add constraint "travel_group_steward_id_foreign" foreign key ("steward_id") references "go-train-group-pass"."user" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_user_id_foreign" foreign key ("user_id") references "go-train-group-pass"."user" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "go-train-group-pass"."users" drop column "name";`);

    this.addSql(`alter table "go-train-group-pass"."users" add column "full_name" varchar(255) null, add column "avatar_url" varchar(255) null, add column "is_active" bool not null default true;`);
    this.addSql(`alter table "go-train-group-pass"."users" alter column "phone_number" type varchar(255) using ("phone_number"::varchar(255));`);
  }

}

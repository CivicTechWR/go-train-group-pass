import { Migration } from '@mikro-orm/migrations';

export class Migration20251206231716 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."itinerary" add column "itinerary_hash" varchar(255) not null;`);
    this.addSql(`alter table "go-train-group-pass"."itinerary" add constraint "itinerary_user_id_itinerary_hash_unique" unique ("user_id", "itinerary_hash");`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" add constraint "trip_booking_user_id_trip_id_unique" unique ("user_id", "trip_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."itinerary" drop constraint "itinerary_user_id_itinerary_hash_unique";`);
    this.addSql(`alter table "go-train-group-pass"."itinerary" drop column "itinerary_hash";`);

    this.addSql(`alter table "go-train-group-pass"."trip_booking" drop constraint "trip_booking_user_id_trip_id_unique";`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20251209034629 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."itinerary" add column "trip_hash" varchar(255) null;`);

    this.addSql(`
      UPDATE "go-train-group-pass"."itinerary" i
      SET trip_hash = (
          SELECT md5(STRING_AGG(tb.trip_id::text, ',' ORDER BY tb.sequence))
          FROM "go-train-group-pass"."trip_booking" tb
          WHERE tb.itinerary_id = i.id
      )
      WHERE trip_hash IS NULL;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."itinerary" drop column "trip_hash";`);
  }

}

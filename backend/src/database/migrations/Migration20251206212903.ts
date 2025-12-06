import { Migration } from '@mikro-orm/migrations';

export class Migration20251206212903 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."trip_booking" alter column "member_present" type boolean using ("member_present"::boolean);`);
    this.addSql(`alter table "go-train-group-pass"."trip_booking" alter column "member_present" set default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "go-train-group-pass"."trip_booking" alter column "member_present" type boolean using ("member_present"::boolean);`);
    this.addSql(`alter table "go-train-group-pass"."trip_booking" alter column "member_present" set default true;`);
  }

}

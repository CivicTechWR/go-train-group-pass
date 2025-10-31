import { Migration } from '@mikro-orm/migrations';

export class Migration20251031000718_CreateUserTable extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "full_name" varchar(255) null, "phone_number" varchar(255) null, "avatar_url" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "last_sign_in_at" timestamptz null, "is_active" boolean not null default true, "auth_user_id" uuid not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
    this.addSql(`alter table "users" add constraint "users_auth_user_id_unique" unique ("auth_user_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}

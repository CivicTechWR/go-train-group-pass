import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forRoot(), MikroOrmModule.forFeature({})],
  exports: [MikroOrmModule],
})
export class OrmModule {}

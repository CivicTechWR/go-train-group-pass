import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './modules/config.module';
import { OrmModule } from './modules/orm.module';
import { AuthModule } from './auth/auth.module';
import { GtfsModule } from './gtfs/gtfs.module';

@Module({
  imports: [
    AppConfigModule,
    OrmModule,
    AuthModule,
    GtfsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

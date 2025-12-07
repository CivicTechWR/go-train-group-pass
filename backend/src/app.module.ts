import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './modules/config.module';
import { OrmModule } from './modules/orm.module';
import { AuthModule } from './modules/auth/auth.module';
import { GtfsModule } from './gtfs/gtfs.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ResponseSerializeInterceptor } from './common/interceptors/response.interceptor';
import { TripScheduleModule } from './trip-schedule/trip-schedule.module';

@Module({
  imports: [
    AppConfigModule,
    OrmModule,
    AuthModule,
    GtfsModule,
    TripScheduleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSerializeInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}

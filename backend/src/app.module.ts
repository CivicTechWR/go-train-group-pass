import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseSerializeInterceptor } from './common/interceptors/response.interceptor';
import { GtfsModule } from './gtfs/gtfs.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfigModule } from './modules/config.module';
import { OrmModule } from './modules/orm.module';
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
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
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

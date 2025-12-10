import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './modules/config.module';
import { OrmModule } from './modules/orm.module';
import { AuthModule } from './modules/auth/auth.module';
import { GtfsModule } from './gtfs/gtfs.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ResponseSerializeInterceptor } from './common/interceptors/response.interceptor';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { TripModule } from './trip/trip.module';
import { TripBookingModule } from './trip-booking/trip-booking.module';
import { TripScheduleModule } from './trip-schedule/trip-schedule.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ItinerarySubscriber } from './subscribers/itinerary.subscriber';

@Module({
  imports: [
    AppConfigModule,
    OrmModule,
    AuthModule,
    GtfsModule,
    ItinerariesModule,
    TripModule,
    TripBookingModule,
    TripScheduleModule,
  ],
  controllers: [AppController],
  exports: [
    AppService,
    ItinerariesModule,
    TripModule,
    TripBookingModule,
    TripScheduleModule,
  ],
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
    ItinerarySubscriber,
  ],
})
export class AppModule {}

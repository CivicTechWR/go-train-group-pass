import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './modules/config.module';
import { OrmModule } from './modules/orm.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AppConfigModule, OrmModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

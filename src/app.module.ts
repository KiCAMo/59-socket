import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

import { HealthcheckController } from './healthcheck/healthcheck.controller';

import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
// import { SocketModule } from './socket/socket.module';
import { LoggerModule } from './logger/logger.module';
import { MomentModule } from '@ccmos/nestjs-moment';
import { TasksModule } from './task/tasks.module';
// import { UploadModule } from './upload/upload.module';
import { RedisCacheModule } from './cache/cache.module';
// import { InplayRmqModule } from './inplayRmq/rmq.module';
// import { PrematchRmqModule } from './prematchRmq/rmq.module';
// import { ApiModule } from './api/api.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    // SocketModule,
    CoreModule,
    MomentModule.forRoot({
      tz: 'Asia/Seoul',
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    // UploadModule,
    RedisCacheModule,
    // InplayRmqModule,
    // PrematchRmqModule,
    // ApiModule,
  ],
  providers: [],
  controllers: [HealthcheckController],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

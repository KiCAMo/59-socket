import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

import { HealthcheckController } from './healthcheck/healthcheck.controller';

import { SocketModule } from './socket/socket.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [LoggerModule, SocketModule],
  providers: [],
  controllers: [HealthcheckController],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

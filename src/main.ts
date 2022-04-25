import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { SocketIoAdapter } from './adapters/socket-io.adapters';
// import { RedisIoAdapter } from './adapters/redis-io.adapter';

import config from 'config';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';

const appSettings = config.get<IAppSettings>('APP_SETTINGS');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(options);
  // app.useWebSocketAdapter(new SocketIoAdapter(app));
  // app.useWebSocketAdapter(new RedisIoAdapter(app));

  app.use(json({ limit: appSettings.bodyLimit }));
  app.use(
    urlencoded({
      limit: appSettings.bodyLimit,
      extended: true,
      parameterLimit: appSettings.bodyParameterLimit,
    }),
  );
  app.use(cookieParser());

  await app.listen(appSettings.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

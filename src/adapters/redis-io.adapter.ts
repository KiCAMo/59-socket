import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

// import config from 'config';
// const redisSettings = config.get<IRedisSettings>('REDIS_SETTINGS');
const pubClient = createClient({
  url: 'redis://platform.91qhwr.ng.0001.apne1.cache.amazonaws.com:6379',
});
pubClient.connect();

const subClient = pubClient.duplicate();
const redisAdapter = createAdapter(pubClient, subClient);

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}

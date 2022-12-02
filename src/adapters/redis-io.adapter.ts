import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

// import config from 'config';
// const redisSettings = config.get<IRedisSettings>('REDIS_SETTINGS');
const pubClient = createClient({
  url: 'redis://127.0.0.1:6379',
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

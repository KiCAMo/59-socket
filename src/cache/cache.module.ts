import { CacheModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

import * as redisStore from 'cache-manager-redis-store';
import config from 'config';

const redisSettings = config.get<IRedisSettings>('REDIS_SETTINGS');

const cacheModule = CacheModule.registerAsync({
  useFactory: () => ({
    store: redisStore,
    host: redisSettings.host,
    port: 6379,
    ttl: 0,
  }),
});

@Module({
  imports: [cacheModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}

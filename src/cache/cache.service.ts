// 캐시 관련 로직을 포함하는 파일
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async setKey(key, value) {
    // 캐시에 항목 추가
    await this.cacheManager.set(key, value, { ttl: 3600000 });
    return true;
  }

  async getKey(key) {
    // 캐시에 항목 추가
    const result = await this.cacheManager.get(key);
    return result;
  }

  async delKey(key) {
    // 캐시에 항목 삭제
    const result = await this.cacheManager.del(key);
    return result;
  }
}

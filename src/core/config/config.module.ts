import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Sites } from './config.entity';
import { ConfigService } from './config.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sites])],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

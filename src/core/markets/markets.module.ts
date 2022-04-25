import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Markets } from './markets.entity';
import { MarketsService } from './markets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Markets])],
  providers: [MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}

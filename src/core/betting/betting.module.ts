import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Betting } from './betting.entity';
import { BettingService } from './betting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Betting])],
  providers: [BettingService],
  exports: [BettingService],
})
export class BettingModule {}

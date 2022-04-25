import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Bets } from './bets.entity';
import { BetsService } from './bets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bets])],
  providers: [BetsService],
  exports: [BetsService],
})
export class BetsModule {}

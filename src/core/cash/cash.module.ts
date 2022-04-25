import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Cash } from './cash.entity';
import { CashService } from './cash.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cash])],
  providers: [CashService],
  exports: [CashService],
})
export class CashModule {}

import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Banks } from './banks.entity';
import { BanksService } from './banks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Banks])],
  providers: [BanksService],
  exports: [BanksService],
})
export class BanksModule {}

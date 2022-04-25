import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Sports } from './sports.entity';
import { SportsService } from './sports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sports])],
  providers: [SportsService],
  exports: [SportsService],
})
export class SportsModule {}

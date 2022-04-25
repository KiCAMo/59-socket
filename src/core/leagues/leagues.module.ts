import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Leagues } from './leagues.entity';
import { LeaguesService } from './leagues.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leagues])],
  providers: [LeaguesService],
  exports: [LeaguesService],
})
export class LeaguesModule {}

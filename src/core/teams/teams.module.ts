import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Teams } from './teams.entity';
import { TeamsService } from './teams.service';

@Module({
  imports: [TypeOrmModule.forFeature([Teams])],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}

import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersLogs } from './membersLogs.entity';
import { MembersLogsService } from './membersLogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([MembersLogs])],
  providers: [MembersLogsService],
  exports: [MembersLogsService],
})
export class MembersLogsModule {}

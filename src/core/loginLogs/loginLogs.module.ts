import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLogs } from './loginLogs.entity';
import { LoginLogsService } from './loginLogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLogs])],
  providers: [LoginLogsService],
  exports: [LoginLogsService],
})
export class LoginLogsModule {}

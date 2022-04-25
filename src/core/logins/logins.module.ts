import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Logins } from './logins.entity';
import { LoginsService } from './logins.service';

@Module({
  imports: [TypeOrmModule.forFeature([Logins])],
  providers: [LoginsService],
  exports: [LoginsService],
})
export class LoginsModule {}

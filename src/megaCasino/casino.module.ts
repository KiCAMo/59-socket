import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Members } from '../core/members/members.entity';
import { MembersService } from '../core/members/members.service';
import { CasinoService } from './casino.service';
import { CasinoController } from './casino.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Members])],
  providers: [CasinoService, MembersService],
  controllers: [CasinoController],
  exports: [CasinoService],
})
export class CasinoModule {}

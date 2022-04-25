import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Members } from './members.entity';
import { MembersService } from './members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Members])],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}

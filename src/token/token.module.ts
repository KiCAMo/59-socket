import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Members } from '../core/members/members.entity';
import { MembersService } from '../core/members/members.service';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Members])],
  providers: [TokenService, MembersService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}

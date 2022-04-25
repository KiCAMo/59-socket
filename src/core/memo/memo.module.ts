import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Memos } from './memo.entity';
import { MemoService } from './memo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Memos])],
  providers: [MemoService],
  exports: [MemoService],
})
export class MemoModule {}

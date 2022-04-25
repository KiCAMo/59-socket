import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Folders } from './folders.entity';
import { FoldersService } from './folders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Folders])],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}

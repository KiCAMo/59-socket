import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Notes } from './notes.entity';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notes])],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}

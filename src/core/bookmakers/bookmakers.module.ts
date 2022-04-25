import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BookMakers } from './bookmakers.entity';
import { BookmakersService } from './bookmakers.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookMakers])],
  providers: [BookmakersService],
  exports: [BookmakersService],
})
export class BookmakersModule {}

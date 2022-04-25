import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Results } from './results.entity';
import { ResultsService } from './results.service';

@Module({
  imports: [TypeOrmModule.forFeature([Results])],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}

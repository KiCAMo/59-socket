import { Module } from '@nestjs/common';

import { LotusService } from './lotus.service';

@Module({
  imports: [],
  providers: [LotusService],
  controllers: [],
  exports: [LotusService],
})
export class LotusModule {}

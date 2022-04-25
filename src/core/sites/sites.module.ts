import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Sites } from './sites.entity';
import { SitesService } from './sites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sites])],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}

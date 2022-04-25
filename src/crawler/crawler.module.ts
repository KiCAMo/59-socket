import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [CoreModule],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}

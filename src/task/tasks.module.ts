import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { LotusModule } from '../lotus/lotus.module';
import { CrawlerModule } from '../crawler/crawler.module';
// import { SocketModule } from '../socket/socket.module';
// import { CalcService } from './calc/calc.service';
// import { DataService } from './data/data.service';
import { GetGameService } from './game/game.service';
// import { InplayService } from './game/inplay.service';
import { GameStatusService } from './game/status.service';
// import { MiniService } from './mini/mini.service';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [CoreModule, LotusModule, CrawlerModule, RedisCacheModule],
  providers: [
    // CalcService,
    // DataService,
    GetGameService,
    // InplayService,
    GameStatusService,
    // MiniService,
  ],
})
export class TasksModule {}

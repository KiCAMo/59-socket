import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

import { CoreModule } from '../core/core.module';
// import { TokenModule } from '../token/token.module';
import { OAuthModule } from '../oauth/oauth.module';
// import { LotusModule } from '../lotus/lotus.module';
// import { MembersGateway } from './members/members.gateway';
// import { GameGateway } from './game/game.gateway';
// import { CashGateway } from './cash/cash.gateway';
// import { SettingGateway } from './setting/setting.gateway';
// import { StaticsGateway } from './statics/statics.gateway';
// import { BettingGateway } from './betting/betting.gateway';
// import { BoardGateway } from './board/board.gateway';
// import { TeamsGateway } from './teams/teams.gateway';
// import { LocationsGateway } from './locations/locations.gateway';
// import { LeaguesGateway } from './leagues/leagues.gateway';
// import { SportsGateway } from './sports/sports.gateway';
// import { MarketsGateway } from './markets/markets.gateway';
// import { FoldersGateway } from './folders/folders.gateway';
// import { SalesGateway } from './sales/sales.gateway';

// import { CrawlerModule } from '../crawler/crawler.module';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CoreModule,
    // TokenModule,
    OAuthModule,
    // LotusModule,
    // CrawlerModule,
    RedisCacheModule,
  ],
  providers: [
    SocketGateway,
    // MembersGateway,
    // GameGateway,
    // CashGateway,
    // SettingGateway,
    // StaticsGateway,
    // BettingGateway,
    // BoardGateway,
    // TeamsGateway,
    // LocationsGateway,
    // LeaguesGateway,
    // SportsGateway,
    // MarketsGateway,
    // FoldersGateway,
    // SalesGateway,
  ],
  exports: [SocketGateway],
})
export class SocketModule {}

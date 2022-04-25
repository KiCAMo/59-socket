import { Module } from '@nestjs/common';

import { MembersModule } from './members/members.module';
import { LoginLogsModule } from './loginLogs/loginLogs.module';
import { EventModule } from './event/event.module';
import { BettingModule } from './betting/betting.module';
import { TeamsModule } from './teams/teams.module';
import { SportsModule } from './sports/sports.module';
import { LeaguesModule } from './leagues/leagues.module';
import { LocationsModule } from './locations/locations.module';
import { MarketsModule } from './markets/markets.module';
import { BookmakersModule } from './bookmakers/bookmakers.module';
import { FoldersModule } from './folders/folders.module';
import { CashModule } from './cash/cash.module';
import { LoginsModule } from './logins/logins.module';
import { GameModule } from './game/game.module';
import { ConfigModule } from './config/config.module';
import { SitesModule } from './sites/sites.module';
import { NotesModule } from './notes/notes.module';
import { MembersLogsModule } from './membersLogs/membersLogs.module';
import { BanksModule } from './banks/banks.module';
import { ResultsModule } from './results/results.module';
import { BetsModule } from './bets/bets.module';

@Module({
  imports: [
    MembersModule,
    LoginLogsModule,
    EventModule,
    BettingModule,
    TeamsModule,
    SportsModule,
    LeaguesModule,
    LocationsModule,
    MarketsModule,
    BookmakersModule,
    FoldersModule,
    CashModule,
    LoginsModule,
    GameModule,
    ConfigModule,
    SitesModule,
    NotesModule,
    MembersLogsModule,
    BanksModule,
    ResultsModule,
    BetsModule,
  ],
  providers: [],
  exports: [
    MembersModule,
    LoginLogsModule,
    EventModule,
    BettingModule,
    TeamsModule,
    SportsModule,
    LeaguesModule,
    LocationsModule,
    MarketsModule,
    BookmakersModule,
    FoldersModule,
    CashModule,
    LoginsModule,
    GameModule,
    ConfigModule,
    SitesModule,
    NotesModule,
    MembersLogsModule,
    BanksModule,
    ResultsModule,
    BetsModule,
  ],
})
export class CoreModule {}

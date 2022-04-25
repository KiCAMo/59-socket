import { Injectable, Logger } from '@nestjs/common';

import { CrawlerService } from '../../crawler/crawler.service';
import { LeaguesService } from '../../core/leagues/leagues.service';
import { MarketsService } from '../../core/markets/markets.service';
import { LocationsService } from '../../core/locations/locations.service';
import { SportsService } from '../../core/sports/sports.service';
import { BookmakersService } from '../../core/bookmakers/bookmakers.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  constructor(
    private crawlerService: CrawlerService,
    private leaguesService: LeaguesService,
    private marketsService: MarketsService,
    private locationsService: LocationsService,
    private sportsService: SportsService,
    private bookmakersService: BookmakersService,
  ) {}
  // 전체를 받아옴
  @Cron('0 50 23 * * *')
  async getLeagues() {
    this.logger.debug('리그 가져오기 시작');
    const result = await this.crawlerService.getLeagues();
    const leagues = result.data;
    const allLeagues = await this.leaguesService.findAll();
    const insertLeague = [];
    for (const l in leagues.Body) {
      const league = leagues.Body[l];
      const 리그ID = league.Id;
      const 국가ID = league.LocationId;
      const 리그명 = league.Name;
      const 종목ID = league.SportId;
      const findLeagues = allLeagues.find((e) => e.leagues_id === 리그ID);

      if (!findLeagues) {
        insertLeague.push({
          leagues_id: 리그ID,
          leagues_sport: 종목ID,
          leagues_location: 국가ID,
          leagues_name_en: 리그명,
        });
      }
    }

    await this.leaguesService.insertMany(insertLeague);
  }

  @Cron('59 59 23 * * *')
  async getMarkets() {
    this.logger.debug('마켓 가져오기 시작');
    const result = await this.crawlerService.getMarkets();
    const markets = result.data;

    for (const l in markets.Body) {
      const market = markets.Body[l];
      const ID = market.Id;
      const 이름 = market.Name;

      const beforeMarket = await this.marketsService.findOneBy({
        markets_id: ID,
      });

      if (!beforeMarket) {
        await this.marketsService.create({
          markets_id: ID,
          markets_name_en: 이름,
        });
      } else {
        beforeMarket.markets_name_en = 이름;
        await this.marketsService.save(beforeMarket);
      }
    }
  }

  // @Cron('59 5 1 * * *')
  async getLocations() {
    this.logger.debug('국가 가져오기 시작');
    const result = await this.crawlerService.getLocations();
    const locations = result.data;

    for (const l in locations.Body) {
      const obj = locations.Body[l];
      const ID = obj.Id;
      const 이름 = obj.Name;

      const beforeMarket = await this.locationsService.findOneBy({
        locations_id: ID,
      });

      if (!beforeMarket) {
        await this.locationsService.create({
          locations_id: ID,
          locations_name_en: 이름,
        });
      } else {
        beforeMarket.locations_name_en = 이름;
        await this.locationsService.save(beforeMarket);
      }
    }
  }

  @Cron('59 10 1 * * *')
  async getSports() {
    this.logger.debug('종목 가져오기 시작');
    const result = await this.crawlerService.getSports();
    const sports = result.data;

    for (const l in sports.Body) {
      const obj = sports.Body[l];
      const ID = obj.Id;
      const 이름 = obj.Name;

      const before = await this.sportsService.findOneBy({
        sports_id: ID,
      });

      if (!before) {
        await this.sportsService.create({
          sports_id: ID,
          sports_name_en: 이름,
        });
      } else {
        before.sports_name_en = 이름;
        await this.sportsService.save(before);
      }
    }
  }

  @Cron('59 15 1 * * *')
  async getBookmakers() {
    this.logger.debug('북메이커 가져오기 시작');
    const result = await this.crawlerService.getBookmakers();
    const bookmakers = result.data;

    for (const l in bookmakers.Body) {
      const obj = bookmakers.Body[l];
      const ID = obj.Id;
      const 이름 = obj.Name;

      const before = await this.bookmakersService.findOneBy({
        bookmakers_id: ID,
      });

      if (!before) {
        await this.bookmakersService.create({
          bookmakers_id: ID,
          bookmakers_name_en: 이름,
        });
      } else {
        before.bookmakers_name_en = 이름;
        await this.bookmakersService.save(before);
      }
    }
  }
}

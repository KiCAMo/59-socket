import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Game } from './game.entity';
import moment from 'moment';

@Injectable()
export class GameService extends ServiceHelper<Game> {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {
    super(gameRepository);
  }

  async findAndCount({
    keyword = null,
    status = null,
    type = null,
    startDate = null,
    endDate = null,
    sport = null,
    take = null,
    skip = null,
  }) {
    const base = moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss');

    let query = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .leftJoinAndSelect('folders.markets', 'market')
      .leftJoinAndSelect('folders.bookmakers', 'bookmaker')
      .where('1=1')
      .andWhere('folders.folders_home_price IS NOT NULL')
      .andWhere('folders.folders_away_price IS NOT NULL')
      .andWhere('home_team.teams_name_en IS NOT NULL')
      .andWhere('away_team.teams_name_en IS NOT NULL')
      .andWhere('folders.folders_home_price != :folders_price', {
        folders_price: '',
      })
      .andWhere('folders.folders_away_price != :folders_price', {
        folders_price: '',
      })
      .andWhere('market.markets_status = :markets_status', {
        markets_status: '사용',
      })
      .andWhere('league.leagues_status = :leagues_status', {
        leagues_status: '사용',
      })
      .andWhere('location.locations_status = :locations_status', {
        locations_status: '사용',
      })
      .andWhere('sport.sports_status = :sports_status', {
        sports_status: '사용',
      })
      .andWhere('folders.folders_home_price >= market.markets_min_odds')
      .andWhere('folders.folders_home_price < market.markets_max_odds')
      .andWhere('folders.folders_away_price >= market.markets_min_odds')
      .andWhere('folders.folders_away_price < market.markets_max_odds');

    if (type)
      query = query.andWhere('folders.folders_type IN (:type)', { type });
    if (status) query = query.andWhere('game.game_status=:status', { status });
    if (startDate)
      query = query.andWhere('game.game_starttime>=:startDate', { startDate });
    if (endDate) {
      query = query.andWhere('game.game_starttime<=:endDate', { endDate });
    } else {
      query = query.andWhere('game.game_starttime<=:base', { base });
    }
    if (keyword) {
      query = query.andWhere(
        '(home_team.team_name_en LIKE :keyword OR home_team.team_name_kr1 :keyword OR away_team.team_name_en LIKE :keyword OR away_team.team_name_kr1 :keyword',
        {
          keyword,
        },
      );
    }
    if (sport) query = query.andWhere('game.game_sport = :sport', { sport });

    query.orderBy('game.game_starttime', 'DESC');
    const count = query.getCount();

    if (take) query.take(take);
    if (skip) query.skip(skip);

    const list = query.getMany();

    return { list, count };
  }
  async gameList(type, type2) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const findHours = moment().add(12, 'hours').format('YYYY-MM-DD HH:mm:ss');
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .leftJoinAndSelect('folders.markets', 'market')
      .leftJoinAndSelect('folders.bookmakers', 'bookmaker')

      .where('game.game_type=:type', { type })
      .andWhere('game.game_starttime>:now', { now })
      .andWhere('game.game_starttime<=:findHours', { findHours })
      .andWhere('folders.folders_type=:type2', { type2 })
      .andWhere('folders.folders_home_price IS NOT NULL')
      .andWhere('folders.folders_away_price IS NOT NULL')
      .andWhere('folders.folders_home_price != :folders_price', {
        folders_price: '',
      })
      .andWhere('folders.folders_away_price != :folders_price', {
        folders_price: '',
      })

      .andWhere('league.leagues_name_en IS NOT NULL')
      .andWhere('home_team.teams_name_en IS NOT NULL')
      .andWhere('away_team.teams_name_en IS NOT NULL')
      .orderBy('game.game_starttime', 'ASC')
      .orderBy('folders.folders_market', 'ASC')
      .orderBy('folders.folders_line', 'ASC')
      // .groupBy('folders.folders_market')

      .getMany();

    return result;
  }

  async inPlayList(type, type2) {
    // const now = moment().format('YYYY-MM-DD HH:mm:ss');
    // const findHours = moment().add(6, 'hours').format('YYYY-MM-DD HH:mm:ss');
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .leftJoinAndSelect('folders.markets', 'market')
      .leftJoinAndSelect('folders.bookmakers', 'bookmaker')

      .where('game.game_type=:type', { type })
      // .andWhere('game.game_starttime>:now', { now })
      // .andWhere('game.game_starttime<=:findHours', { findHours })
      .andWhere('game.game_status=:status', { status: '진행' })
      .andWhere('folders.folders_type=:type2', { type2 })
      .andWhere('folders.folders_home_price IS NOT NULL')
      .andWhere('folders.folders_away_price IS NOT NULL')
      .andWhere('folders.bookmakers = game.game_default_bookmaker')

      .andWhere('league.leagues_name_en IS NOT NULL')
      .andWhere('home_team.teams_name_en IS NOT NULL')
      .andWhere('away_team.teams_name_en IS NOT NULL')
      .orderBy('game.game_starttime', 'ASC')
      .orderBy('folders.folders_market', 'ASC')
      .orderBy('folders.folders_line', 'ASC')
      .groupBy('folders.folders_market')
      .getMany();

    return result;
  }

  async yetResultFolders() {
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('folders.markets', 'markets')
      .where('game.game_status=:status', { status: '종료' })
      .andWhere('game.game_type=:type', { type: '스포츠' })
      .andWhere('folders.folders_result=:result', { result: 'wait' })
      .andWhere('game.game_result_home IS NOT NULL')
      .andWhere('game.game_result_away IS NOT NULL')
      .take(100)
      .getMany();
    return result;
  }

  async indexCountList(type) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const findHours = moment().add(12, 'hours').format('YYYY-MM-DD HH:mm:ss');
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .select('game.game_sport, COUNT(game.game_sport) as cnt')
      .where('game.game_type=:type', { type })
      .andWhere('game.game_starttime>:now', { now })
      .andWhere('game.game_starttime<=:findHours', { findHours })
      .groupBy('game.game_sport')
      .getRawMany();
    return result;
  }

  async getGameUpdate() {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const findHours = moment().add(12, 'hours').format('YYYY-MM-DD HH:mm:ss');
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('folders.markets', 'markets')

      .where('game.game_type=:type', { type: '스포츠' })
      .andWhere('game.game_status=:status', { status: '대기' })
      .andWhere('game.game_starttime>:now', { now })
      .andWhere('game.game_starttime<=:findHours', { findHours })
      .andWhere('markets.markets_status = :markets_status', {
        markets_status: '사용',
      })
      .andWhere('league.leagues_status = :leagues_status', {
        leagues_status: '사용',
      })
      .andWhere('location.locations_status = :locations_status', {
        locations_status: '사용',
      })
      .andWhere('sport.sports_status = :sports_status', {
        sports_status: '사용',
      })

      .getMany();
    return result;
  }

  async lists(
    keyword = null,
    startDate = null,
    endDate = null,
    type = null,
    status,
    take,
    skip,
  ) {
    let query = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .leftJoinAndSelect('folders.markets', 'market')
      .leftJoinAndSelect('folders.bookmakers', 'bookmaker')
      .where('game.game_status=:status', { status: '종료' });

    if (type) query = query.andWhere('folders.folders_type=:type', { type });
    if (status) query = query.andWhere('game.game_status=:status', { status });
    if (startDate)
      query = query.andWhere('game.game_starttime>=:startDate', { startDate });
    if (endDate)
      query = query.andWhere('game.game_starttime<=:endDate', { endDate });
    if (keyword)
      query = query.andWhere('home_team.team_name_en LIKE :keyword', {
        keyword,
      });

    query = query.take(take).skip(skip);
    const result = query.getMany();
    return result;
  }

  async lists2(
    keyword = null,
    startDate = null,
    endDate = null,
    type = null,
    status,
    sport = null,
    take,
    skip,
  ) {
    const base = moment().add(2, 'days').format('YYYY-MM-DD HH:mm:ss');

    let query = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .leftJoinAndSelect('folders.markets', 'market')
      .leftJoinAndSelect('folders.bookmakers', 'bookmaker')
      .where('game.game_type=:status2', { status2: '스포츠' });

    if (type)
      query = query.andWhere('folders.folders_type IN (:type)', { type });
    if (status) query = query.andWhere('game.game_status=:status', { status });
    if (startDate)
      query = query.andWhere('game.game_starttime>=:startDate', { startDate });
    if (endDate) {
      query = query.andWhere('game.game_starttime<=:endDate', { endDate });
    } else {
      query = query.andWhere('game.game_starttime<=:base', { base });
    }
    if (keyword) {
      query = query.andWhere(
        '(home_team.team_name_en LIKE :keyword OR home_team.team_name_kr1 :keyword OR away_team.team_name_en LIKE :keyword OR away_team.team_name_kr1 :keyword',
        {
          keyword,
        },
      );
    }
    if (sport) query = query.andWhere('game.game_sport = :sport', { sport });

    query.andWhere('home_team.teams_name_en IS NOT NULL');
    query.andWhere('away_team.teams_name_en IS NOT NULL');
    query.orderBy('game.game_starttime', 'DESC');
    query = query.take(take).skip(skip);
    const result = query.getMany();
    return result;
  }

  async listsCnt(
    keyword = null,
    startDate = null,
    endDate = null,
    type = null,
    status,
  ) {
    const base = moment().add(2, 'days').format('YYYY-MM-DD HH:mm:ss');
    let query = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.folders', 'folders')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .leftJoinAndSelect('folders.markets', 'market')
      .leftJoinAndSelect('folders.bookmakers', 'bookmaker')
      .where('game.game_type=:status2', { status2: '스포츠' });

    if (type)
      query = query.andWhere('folders.folders_type IN (:type)', { type });
    if (status) query = query.andWhere('game.game_status=:status', { status });
    if (startDate)
      query = query.andWhere('game.game_starttime>=:startDate', { startDate });
    if (endDate) {
      query = query.andWhere('game.game_starttime<=:endDate', { endDate });
    } else {
      query = query.andWhere('game.game_starttime<=:base', { base });
    }
    if (keyword)
      query = query.andWhere('home_team.team_name_en LIKE :keyword', {
        keyword,
      });

    query.andWhere('home_team.teams_name_en IS NOT NULL');
    query.andWhere('away_team.teams_name_en IS NOT NULL');

    const result = query.getCount();
    return result;
  }

  async gameResulted() {
    const fromDate = moment()
      .subtract(1, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');
    const toDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .where('game.game_type=:type', { type: '스포츠' })
      .andWhere('game.game_status IN (:status)', {
        status: ['대기', '진행', '종료'],
      })
      .andWhere('game.game_resulted=:resulted', { resulted: '대기' })
      .andWhere('game.game_starttime>=:fromDate', { fromDate })
      .andWhere('game.game_starttime<:toDate', { toDate })
      .take(100)
      .getMany();
    return result;
  }

  async gameOrdered() {
    // const fromDate = moment()
    //   .subtract(10, 'hours')
    //   .format('YYYY-MM-DD HH:mm:ss');
    //
    // const toDate = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
    const result = await this.gameRepository
      .createQueryBuilder('game')
      .where('game.game_type=:type', { type: '스포츠' })
      .andWhere('game.game_status IN (:status)', { status: ['진행', '대기'] })
      .andWhere('game.game_ordered=:ordered', { ordered: '완료' })
      // .andWhere('game.game_starttime>=:fromDate', { fromDate })
      // .andWhere('game.game_starttime<=:toDate', { toDate })
      .take(20)
      .getMany();
    return result;
  }

  async insertMany(arr) {
    const result = await this.gameRepository
      .createQueryBuilder()
      .insert()
      .into(Game)
      .values(arr)
      .execute();
    return result;
  }

  async updateInMany(arr, key) {
    const result = await this.gameRepository
      .createQueryBuilder()
      .update(Game)
      .set(key)
      .where('game_id IN (:arr)', { arr })
      .execute();
    return result;
  }

  async updateWaiting() {
    const result = await this.gameRepository
      .createQueryBuilder()
      .update(Game)
      .set({ game_status: '진행' })
      .where(
        'game_starttime < CURRENT_TIMESTAMP AND game_status = :status AND game_type = :type',
        {
          status: '대기',
          type: '스포츠',
        },
      )
      .execute();
    return result;
  }

  async updateBulk(updates) {
    const promises = updates.map((update) => {
      const query = { game_id: update.game_id };
      delete update.game_id;
      delete update.game_seq;
      return this.gameRepository.update(query, update);
    });
    return await Promise.all(promises);
  }
}

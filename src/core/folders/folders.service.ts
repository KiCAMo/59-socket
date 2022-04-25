import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Folders } from './folders.entity';
import moment from 'moment';

@Injectable()
export class FoldersService extends ServiceHelper<Folders> {
  constructor(
    @InjectRepository(Folders)
    private foldersRepository: Repository<Folders>,
  ) {
    super(foldersRepository);
  }

  async gameResult(type, take, skip) {
    // const result = await this.foldersRepository.manager.query(`
    //    SELECT a.*, b.*, c.*, d.*, e.*, f.teams_name_en AS home_team_name_en, f.teams_name_kr1 AS home_team_name_kr1, f.teams_name_kr2 AS home_teams_name_kr2, g.teams_name_en AS away_team_name_en, g.teams_name_kr1 AS away_team_name_kr1, g.teams_name_kr2 AS away_teams_name_kr2
    //    FROM folders a
    //     LEFT OUTER JOIN game b ON a.folders_game=b.game_id
    //     LEFT OUTER JOIN sports c ON c.sports_id=b.game_sport
    //     LEFT OUTER JOIN leagues d ON d.leagues_id=b.game_league
    //     LEFT OUTER JOIN markets e ON e.markets_id=a.folders_market
    //     LEFT OUTER JOIN teams f ON f.teams_id=b.game_home_team
    //     LEFT OUTER JOIN teams g ON g.teams_id=b.game_away_team
    //     LEFT OUTER JOIN locations h ON h.locations_id=b.game_location
    //    WHERE 1=1 ${where}
    //    ORDER BY game_updatedate
    //    LIMIT ${skip}, ${take}
    // `);
    // return result;

    const result = await this.foldersRepository
      .createQueryBuilder('folders')
      .leftJoinAndSelect('folders.game', 'game')
      .leftJoinAndSelect('folders.markets', 'markets')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .where('game.game_status=:status', { status: '종료' })
      .andWhere('folders.folders_type=:type', { type })
      .andWhere('folders.folders_home_price IS NOT NULL')
      .andWhere('folders.folders_away_price IS NOT NULL')
      .andWhere('folders.folders_result != :result', { result: 'wait' })

      .orderBy('game.game_starttime', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();
    return result;
  }

  async foldersCount(type) {
    const result = await this.foldersRepository
      .createQueryBuilder('folders')
      .leftJoinAndSelect('folders.game', 'game')
      .leftJoinAndSelect('folders.markets', 'markets')
      .leftJoinAndSelect('game.sport', 'sport')
      .leftJoinAndSelect('game.league', 'league')
      .leftJoinAndSelect('game.location', 'location')
      .leftJoinAndSelect('game.home_team', 'home_team')
      .leftJoinAndSelect('game.away_team', 'away_team')
      .where('game.game_status=:status', { status: '종료' })
      .andWhere('folders.folders_type=:type', { type })
      .andWhere('folders.folders_home_price IS NOT NULL')
      .andWhere('folders.folders_away_price IS NOT NULL')
      .andWhere('folders.folders_result != :result', { result: 'wait' })
      .getCount();
    return result;
  }

  async recentEndFolders() {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const findHours = moment()
      .subtract(1, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');
    // const result = await this.foldersRepository.find({
    //   relations: ['bettings', 'markets'],
    //   where: {
    //     folders_result: Not('wait'),
    //     folders_updatedate: Between(findHours, now),
    //   },
    // });

    const result = await this.foldersRepository
      .createQueryBuilder('folders')
      .leftJoinAndSelect('folders.bettings', 'bettings')
      .leftJoinAndSelect('folders.markets', 'markets')
      .leftJoinAndSelect('folders.game', 'game')
      .where('folders.folders_result!=:status', { status: 'wait' })
      .andWhere('folders.folders_updatedate>=:findHours', { findHours })
      .andWhere('folders.folders_updatedate<=:now', { now })
      .andWhere('bettings.betting_payed=:yes', { yes: 'n' })
      .getMany();
    return result;
  }

  async insertMany(arr) {
    const result = await this.foldersRepository
      .createQueryBuilder()
      .insert()
      .into(Folders)
      .values(arr)
      .execute();
    return result;
  }
}

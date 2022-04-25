import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Leagues } from './leagues.entity';

@Injectable()
export class LeaguesService extends ServiceHelper<Leagues> {
  constructor(
    @InjectRepository(Leagues)
    private leaguesRepository: Repository<Leagues>,
  ) {
    super(leaguesRepository);
  }

  async findAndCount({
    keyword = null,
    status = null,
    sport = null,
    location = null,
    take = null,
    skip = null,
    sitename = null,
  }) {
    const query = await this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoinAndSelect('league.location', 'location')
      .leftJoinAndSelect('league.sport', 'sport')
      .where('1=1');

    if (status)
      query.andWhere('league.leagues_status=:status', { status: '정상' });
    if (keyword)
      query.andWhere(
        'league.leagues_name_en LIKE :keyword OR leagues_name_kr1 LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    if (sitename)
      query.andWhere('league.leagues_sitename=:sitename', { sitename });
    if (sport) query.andWhere('league.leagues_sport=:sport', { sport });
    if (location)
      query.andWhere('league.leagues_location=:location', { location });

    const count = query.getCount();

    if (take) query.take(take);
    if (skip) query.skip(skip);

    const list = query.getMany();

    return { list, count };
  }

  async insertMany(arr) {
    const result = await this.leaguesRepository
      .createQueryBuilder()
      .insert()
      .into(Leagues)
      .values(arr)
      .execute();
    return result;
  }
}

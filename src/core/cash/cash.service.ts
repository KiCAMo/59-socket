import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Cash } from './cash.entity';
import moment from 'moment';

@Injectable()
export class CashService extends ServiceHelper<Cash> {
  constructor(
    @InjectRepository(Cash)
    public readonly cashRepository: Repository<Cash>,
  ) {
    super(cashRepository);
  }
  async totalCashSum(type, status, sitename = null) {
    const startDate = moment().format('YYYY-MM-DD 00:00:00');
    const endDate = moment().format('YYYY-MM-DD 23:59:59');
    let query = await this.cashRepository
      .createQueryBuilder('cash')
      .select('SUM(cash.cash_amount)', 'sum')
      .where('cash.cash_status=:status', { status })
      .andWhere('cash.cash_type=:type', { type })
      .andWhere('cash.cash_done_datetime>=:startDate', { startDate })
      .andWhere('cash.cash_done_datetime<=:endDate', { endDate });

    if (sitename)
      query = query.andWhere('cash.cash_sitename=:sitename', { sitename });
    const result = query.getRawOne();
    return result;
  }

  async todayCashLog(sitename) {
    const startDate = moment().format('YYYY-MM-DD 00:00:00');
    const endDate = moment().format('YYYY-MM-DD 23:59:59');
    let query = await this.cashRepository
      .createQueryBuilder('cash')
      .where('cash.cash_done_datetime>=:startDate', { startDate })
      .andWhere('cash.cash_done_datetime<=:endDate', { endDate });
    if (sitename)
      query = query.andWhere('cash.cash_sitename=:sitename', { sitename });
    const result = query.getMany();
    return result;
  }

  async findAndCount({
    take = null,
    skip = null,
    status = null,
    keyword = null,
    type = null,
    startDate = null,
    endDate = null,
    sitename = null,
    members_type = null,
  }) {
    let query = await this.cashRepository
      .createQueryBuilder('cash')
      .leftJoinAndSelect('cash.member', 'member')
      .where('1=1');
    if (sitename)
      query = query.andWhere('cash.cash_sitename=:sitename', { sitename });
    if (startDate)
      query.andWhere('cash.cash_regdatetime=:startDate', { startDate });
    if (endDate) query.andWhere('cash.cash_regdatetime=:endDate', { endDate });
    if (keyword)
      query = query.andWhere('member.members_nickname LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    if (members_type)
      query = query.andWhere('member.members_type = :members_type', {
        members_type,
      });
    if (status) query = query.andWhere('cash.cash_status=:status', { status });
    if (type) query = query.andWhere('cash.cash_type=:type', { type });
    const count = query.getCount();

    if (take) query.take(take);
    if (skip) query.skip(skip);

    const list = query.getMany();

    return { list, count };
  }

  async insertMany(arr) {
    const result = await this.cashRepository
      .createQueryBuilder()
      .insert()
      .into(Cash)
      .values(arr)
      .execute();

    return result;
  }
}

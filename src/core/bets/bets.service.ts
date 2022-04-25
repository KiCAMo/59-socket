import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Bets } from './bets.entity';

@Injectable()
export class BetsService extends ServiceHelper<Bets> {
  constructor(
    @InjectRepository(Bets)
    private betsRepository: Repository<Bets>,
  ) {
    super(betsRepository);
  }

  async insertMany(arr) {
    const result = await this.betsRepository
      .createQueryBuilder()
      .insert()
      .into(Bets)
      .values(arr)
      .execute();
    return result;
  }

  async updateBulk(updates) {
    const promises = updates.map((update) => {
      const query = { bets_id: update.bets_id, bets_name: update.bets_name };
      delete update.bets_id;
      delete update.bets_seq;
      delete update.bets_regstamp;
      delete update.bets_start_price;
      delete update.bets_regdate;
      delete update.bets_updatedate;
      delete update.bets_folder;
      return this.betsRepository.update(query, update);
    });
    return await Promise.all(promises);
  }

  async updateInMany(arr, key) {
    const result = await this.betsRepository
      .createQueryBuilder()
      .update(Bets)
      .set(key)
      .where('bets_id IN (:arr)', { arr })
      .execute();
    return result;
  }

  async updateInSeq(arr, key) {
    const result = await this.betsRepository
      .createQueryBuilder()
      .update(Bets)
      .set(key)
      .where('bets_seq IN (:arr)', { arr })
      .execute();
    return result;
  }
}

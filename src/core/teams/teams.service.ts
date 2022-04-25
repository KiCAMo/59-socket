import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Teams } from './teams.entity';

@Injectable()
export class TeamsService extends ServiceHelper<Teams> {
  constructor(
    @InjectRepository(Teams)
    private teamsRepository: Repository<Teams>,
  ) {
    super(teamsRepository);
  }
  async insertMany(arr) {
    const result = await this.teamsRepository
      .createQueryBuilder()
      .insert()
      .into(Teams)
      .values(arr)
      .execute();
    return result;
  }
}

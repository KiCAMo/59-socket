import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Markets } from './markets.entity';

@Injectable()
export class MarketsService extends ServiceHelper<Markets> {
  constructor(
    @InjectRepository(Markets)
    marketsRepository: Repository<Markets>,
  ) {
    super(marketsRepository);
  }
}

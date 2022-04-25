import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Results } from './results.entity';

@Injectable()
export class ResultsService extends ServiceHelper<Results> {
  constructor(
    @InjectRepository(Results) resultsRepository: Repository<Results>,
  ) {
    super(resultsRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Sports } from './sports.entity';

@Injectable()
export class SportsService extends ServiceHelper<Sports> {
  constructor(
    @InjectRepository(Sports)
    sportsRepository: Repository<Sports>,
  ) {
    super(sportsRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Banks } from './banks.entity';

@Injectable()
export class BanksService extends ServiceHelper<Banks> {
  constructor(
    @InjectRepository(Banks)
    public readonly cashRepository: Repository<Banks>,
  ) {
    super(cashRepository);
  }
}

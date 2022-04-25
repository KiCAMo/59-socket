import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Logins } from './logins.entity';

@Injectable()
export class LoginsService extends ServiceHelper<Logins> {
  constructor(
    @InjectRepository(Logins)
    eventsRepository: Repository<Logins>,
  ) {
    super(eventsRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Sites } from './config.entity';

@Injectable()
export class ConfigService extends ServiceHelper<Sites> {
  constructor(@InjectRepository(Sites) configRepository: Repository<Sites>) {
    super(configRepository);
  }
}

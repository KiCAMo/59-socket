import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Sites } from './sites.entity';

@Injectable()
export class SitesService extends ServiceHelper<Sites> {
  constructor(@InjectRepository(Sites) sitesRepository: Repository<Sites>) {
    super(sitesRepository);
  }
}

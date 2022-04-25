import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Locations } from './locations.entity';

@Injectable()
export class LocationsService extends ServiceHelper<Locations> {
  constructor(
    @InjectRepository(Locations)
    locationsRepository: Repository<Locations>,
  ) {
    super(locationsRepository);
  }
}

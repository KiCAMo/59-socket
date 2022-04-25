import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Event } from './event.entity';

@Injectable()
export class EventService extends ServiceHelper<Event> {
  constructor(
    @InjectRepository(Event)
    eventRepository: Repository<Event>,
  ) {
    super(eventRepository);
  }
}

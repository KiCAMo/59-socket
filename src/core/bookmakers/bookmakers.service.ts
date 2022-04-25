import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { BookMakers } from './bookmakers.entity';

@Injectable()
export class BookmakersService extends ServiceHelper<BookMakers> {
  constructor(
    @InjectRepository(BookMakers)
    bookMakersRepository: Repository<BookMakers>,
  ) {
    super(bookMakersRepository);
  }
}

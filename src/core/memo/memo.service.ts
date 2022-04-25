import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Memos } from './memo.entity';

@Injectable()
export class MemoService extends ServiceHelper<Memos> {
  constructor(
    @InjectRepository(Memos)
    notesRepository: Repository<Memos>,
  ) {
    super(notesRepository);
  }
}

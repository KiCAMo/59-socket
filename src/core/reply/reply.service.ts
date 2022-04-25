import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Reply } from './reply.entity';

@Injectable()
export class ReplyService extends ServiceHelper<Reply> {
  constructor(
    @InjectRepository(Reply)
    replyRepository: Repository<Reply>,
  ) {
    super(replyRepository);
  }
}

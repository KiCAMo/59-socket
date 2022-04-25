import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { MembersLogs } from './membersLogs.entity';

@Injectable()
export class MembersLogsService extends ServiceHelper<MembersLogs> {
  constructor(
    @InjectRepository(MembersLogs)
    membersLogsRepository: Repository<MembersLogs>,
  ) {
    super(membersLogsRepository);
  }
}

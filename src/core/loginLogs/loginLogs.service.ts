import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { LoginLogs } from './loginLogs.entity';

@Injectable()
export class LoginLogsService extends ServiceHelper<LoginLogs> {
  constructor(
    @InjectRepository(LoginLogs) logsRepository: Repository<LoginLogs>,
  ) {
    super(logsRepository);
  }
}

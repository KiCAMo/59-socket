import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Template } from './template.entity';

@Injectable()
export class TemplateService extends ServiceHelper<Template> {
  constructor(
    @InjectRepository(Template)
    public readonly templateRepository: Repository<Template>,
  ) {
    super(templateRepository);
  }

  async findAndCount({
    status = null,
    take = null,
    skip = null,
    sitename = null,
  }) {
    let query = await this.templateRepository
      .createQueryBuilder('template')
      .where('1=1');

    if (status)
      query = query.andWhere('template.template_status IN (:status)', {
        status,
      });

    if (sitename)
      query = query.andWhere('members.members_status IN (:sitename)', {
        sitename,
      });

    const count = query.getCount();

    if (take) query.take(take);
    if (skip) query.skip(skip);

    const list = query.getMany();

    return { list, count };
  }
}

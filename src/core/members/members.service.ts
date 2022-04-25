import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Members } from './members.entity';
import { CreateMembersDto } from './dto/create-members.dto';

@Injectable()
export class MembersService extends ServiceHelper<Members> {
  constructor(
    @InjectRepository(Members)
    public readonly membersRepository: Repository<Members>,
  ) {
    super(membersRepository);
  }

  async membersCreate(createMembersDto: CreateMembersDto): Promise<Members> {
    return this.membersRepository.create(createMembersDto);
  }

  async modify(members: Members): Promise<void> {
    const updateMember = await this.membersRepository.findOne(
      members.members_seq,
    );
    updateMember.members_point = members.members_point;
    updateMember.members_mileage = members.members_mileage;
    await this.membersRepository.save(updateMember);
  }

  async parentsAll(lastMember) {
    const parents = [];
    while (true) {
      if (
        !lastMember.members_parent ||
        lastMember.members_partner_type === '사이트'
      ) {
        break;
      }

      const parent = await this.membersRepository.find({
        where: {
          members_seq: lastMember.members_parent,
        },
      });
      parents.push(parent[0]);
      lastMember = parent[0];
    }
    return parents;
  }

  async totalMembersInfo(sitename) {
    const query = await this.membersRepository
      .createQueryBuilder('members')
      .andWhere('members.members_sitename=:sitename', { sitename });

    const result = query.getMany();
    return result;
  }

  async totalMembersCash(type = '회원', sitename) {
    let query = await this.membersRepository
      .createQueryBuilder('members')
      .select('SUM(members.members_point)', 'sum')
      .where('members.members_status!=:status', { status: '취소' })
      .andWhere('members.members_status!=:status2', { status2: '차단' })
      .andWhere('members.members_status!=:status3', { status3: '탈퇴' })
      .andWhere('members.members_sitename=:sitename', { sitename });

    if (type) query = query.andWhere('members.members_type!=:type', { type });

    const result = query.getRawOne();
    return result;
  }

  async findAndCount({
    keyword = null,
    status = null,
    type = null,
    startDate = null,
    endDate = null,
    take = null,
    skip = null,
  }) {
    let query = await this.membersRepository
      .createQueryBuilder('members')
      .where('1=1');

    if (type)
      query = query.andWhere('members.members_type IN (:type)', { type });
    if (status)
      query = query.andWhere('members.members_status IN (:status)', { status });
    if (startDate)
      query = query.andWhere('members.members_regdate>=:startDate', {
        startDate,
      });
    if (endDate) {
      query = query.andWhere('members.members_regdate<=:endDate', { endDate });
    }
    if (keyword) {
      query = query.andWhere(
        'members.members_nickname LIKE :keyword OR members.members_id LIKE :kerword',
        {
          keyword,
        },
      );
    }

    const count = query.getCount();

    if (take) query.take(take);
    if (skip) query.skip(skip);

    const list = query.getMany();

    return { list, count };
  }

  async getAllParents(member) {
    let members_parents = member.members_parent;
    const parents = [];
    while (true) {
      if (members_parents === 0) {
        break;
      }
      const parent = await this.membersRepository.findOne({
        where: {
          members_seq: members_parents,
        },
      });
      parents.push(parent);
      members_parents = parent.members_parent;
    }

    return parents;
  }
}

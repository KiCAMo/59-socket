import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Board } from './board.entity';

@Injectable()
export class BoardService extends ServiceHelper<Board> {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {
    super(boardRepository);
  }

  async findAndCount({
    take = null,
    skip = null,
    status = null,
    keyword = null,
    isNotice = null,
    type = null,
    startDate = null,
    endDate = null,
    sitename = null,
  }) {
    const query = await this.boardRepository
      .createQueryBuilder('board')
      .groupBy('board.betting_betcode')
      .where('1=1');
    if (sitename)
      query.andWhere('board.board_sitename=:sitename', { sitename });
    if (status) query.andWhere('board.board_status=:status', { status });
    if (type) query.andWhere('board.board_type=:type', { type });
    // 검색어 입력시
    if (keyword)
      query.andWhere(
        'board.board_title LIKE :keyword OR board.board_content LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    // 공지사항 여부
    if (isNotice)
      query.andWhere('board.board_is_notice=:isNotice', { isNotice });
    if (startDate)
      query.andWhere('board.board_regdatetime>=:startDate', { startDate });
    if (endDate)
      query.andWhere('board.board_regdatetime<=:endDate', { endDate });

    const count = query.getCount();

    if (take) query.take(take);
    if (skip) query.skip(skip);

    const list = query.getMany();

    return { list, count };
  }
}

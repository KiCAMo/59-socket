import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Betting } from './betting.entity';
import { WsException } from '@nestjs/websockets';
import moment from 'moment';

@Injectable()
export class BettingService extends ServiceHelper<Betting> {
  constructor(
    @InjectRepository(Betting) private bettingRepository: Repository<Betting>,
  ) {
    super(bettingRepository);
  }

  async chulsuk(members_seq) {
    const month = moment().format('YYYY-MM');
    const nextMonth = moment().add(1, 'month').format('YYYY-MM');

    const result = await this.bettingRepository
      .createQueryBuilder('betting')
      .select('betting.betting_seq', 'betting_seq')
      .addSelect(
        "DATE_FORMAT(betting.betting_regdatetime, '%d')",
        'chulsuk_date',
      )
      .where('betting.betting_member=:members_seq', { members_seq })
      .andWhere(
        'betting.betting_regdatetime >= :toDate AND betting.betting_regdatetime < :nextTo',
        { toDate: `${month}-01`, nextTo: `${nextMonth}-01` },
      )
      .andWhere('betting.betting_bet_amount >= 50000')

      .groupBy("DATE_FORMAT(betting.betting_regdatetime, '%d')")
      .orderBy("DATE_FORMAT(betting.betting_regdatetime, '%d')", 'ASC')

      .getRawMany();
    // const result = await this.bettingRepository.manager.query(`
    //     select betting_betcode
    //     from betting
    //     where betting_member=${members_seq}
    //     group by betting_betcode
    //     order by betting_regdatetime
    //     limit ${skip}, ${take}
    // `);
    return result;
  }

  async bettingResult(sitename, result, take, skip) {
    let query = await this.bettingRepository
      .createQueryBuilder('betting')
      // .leftJoinAndSelect('betting.folder', 'folder')
      // .leftJoinAndSelect('folder.markets', 'markets')
      // .leftJoinAndSelect('betting.member', 'member')
      .where('1=1');
    query.andWhere('betting_sitename=:sitename', { sitename });
    if (result) query = query.andWhere('betting_result=:result', { result });

    const row = query
      .groupBy('betting.betting_betcode')
      .orderBy('betting.betting_regdatetime')
      .skip(skip)
      .take(take)
      .getMany();
    return row;
  }

  async bettingCount(sitename) {
    const result = await this.bettingRepository
      .createQueryBuilder('betting')
      .andWhere('betting_sitename=:sitename', { sitename })
      .groupBy('betting.betting_betcode')
      .getCount();
    return result;
  }

  async memberBettingResult(members_seq, take, skip) {
    let query = await this.bettingRepository
      .createQueryBuilder('betting')
      .leftJoinAndSelect('betting.folder', 'folder')
      .leftJoinAndSelect('folder.markets', 'markets')
      .leftJoinAndSelect('betting.member', 'member')
      .where('1=1');

    if (members_seq)
      query = query.andWhere('betting_member=:members_seq', { members_seq });

    const row = query
      .groupBy('betting.betting_betcode')
      .orderBy('betting.betting_regdatetime')
      .skip(skip)
      .take(take)
      .getMany();
    return row;
  }

  async memberBettingCount(members_seq) {
    const result = await this.bettingRepository
      .createQueryBuilder('betting')
      .where('betting_member=:members_seq', { members_seq })
      .groupBy('betting.betting_betcode')
      .getMany();
    return result;
  }

  async codesByBetting(codes) {
    const result = await this.bettingRepository.find({
      relations: [
        'member',
        'folder',
        'folder.markets',
        'folder.game',
        'folder.game.home_team',
        'folder.game.away_team',
        'folder.game.league',
      ],
      where: { betting_betcode: In(codes) },
    });
    return result;
  }

  async validateMembersBetSetting(members, data) {
    const settings = members.members_detail_setting;
    const betType = data.bettings[0].betType;
    const foldersCnt = data.bettings.length;
    const amount = data.amount;
    // const totalOdds = data.totalOdds;

    // 베팅권한 스포츠 검증
    if (
      betType === '프리매치' ||
      betType === '라이브' ||
      betType === '스페셜'
    ) {
      if (!settings.베팅권한.스포츠.active)
        throw new WsException('스포츠 베팅권한이 없습니다.');

      if (betType === '프리매치') {
        // 폴더수 검증
        if (settings.베팅권한.스포츠.minFolder.value > foldersCnt)
          throw new WsException(
            `최소${settings.베팅권한.스포츠.minFolder.value}폴더 이상 베팅하셔야 합니다.`,
          );
      }

      if (settings.베팅권한.스포츠.minAmount > amount)
        throw new WsException(
          `최소${settings.베팅권한.스포츠.minFolder.value}원 이상 베팅하셔야 합니다.`,
        );
    }
    // 미니게임 베팅권한 검증
    if (betType === '미니게임') {
      if (!settings.베팅권한.미니게임.active)
        throw new WsException('미니게임 베팅권한이 없습니다.');

      if (!settings.베팅권한['미니게임'].combination)
        throw new WsException(`${betType} 조합하실수 없습니다.`);
    }
  }

  async lists(member, type, take, skip) {
    const result = await this.bettingRepository
      .createQueryBuilder('betting')
      .leftJoinAndSelect('betting.folder', 'folder')
      .where('betting.betting_member=:member', { member })
      .andWhere('folder.folders_detail=:type', { type })
      .skip(skip)
      .take(take)
      .getMany();
    return result;
  }

  async listsCount(member, type) {
    const result = await this.bettingRepository
      .createQueryBuilder('betting')
      .leftJoinAndSelect('betting.folder', 'folder')
      .where('betting.betting_member=:member', { member })
      .andWhere('folder.folders_detail=:type', { type })
      .getCount();
    return result;
  }

  // async betInfo(status = null, sitename) {
  //   let query = await this.bettingRepository
  //     .createQueryBuilder('betting')
  //     .groupBy('betting.betting_betcode')
  //     .where('betting.betting_sitename=:sitename', { sitename });
  //   if (status)
  //     query = query.andWhere('betting.betting_total_result=:status', {
  //       status,
  //     });
  //
  //   const result = query.getMany();
  //   return result;
  // }

  async updateByBetcode(betcode, val) {
    const result = await this.bettingRepository
      .createQueryBuilder()
      .update('betting')
      // .set({
      //   firstName: "Timber",
      //   lastName: "Saw",
      //   age: () => "age + 1"
      // })
      .set(val)
      .where('betting_betcode = :betcode', { betcode })
      .execute();
    return result;
  }

  async betStatus(sitename) {
    const todayStart = moment().format('YYYY-MM-DD 00:00:00');
    const todayEnd = moment().format('YYYY-MM-DD 23:59:59');
    const query = await this.bettingRepository
      .createQueryBuilder('betting')
      .groupBy('betting.betting_betcode')
      .where('betting.betting_sitename=:sitename', { sitename })
      .andWhere('betting.betting_status=:status', { status: '정상' })
      .andWhere('betting.betting_regdatetime>=:todayStart', { todayStart })
      .andWhere('betting.betting_regdatetime<=:todayEnd', { todayEnd });

    // if (result)
    //   query = query.andWhere('betting.betting_total_result=:result', {
    //     result,
    //   });

    const res = query.getMany();
    return res;
  }
}

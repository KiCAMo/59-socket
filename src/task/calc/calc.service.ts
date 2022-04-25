import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
// import { Not } from 'typeorm';

import { BettingService } from '../../core/betting/betting.service';
import { CashService } from '../../core/cash/cash.service';
import { MembersService } from '../../core/members/members.service';

@Injectable()
export class CalcService {
  private readonly logger = new Logger(CalcService.name);

  constructor(
    private bettingService: BettingService,
    private cashService: CashService,
    private membersService: MembersService,
  ) {}

  @Interval(30000)
  async taskCalcBet() {
    // 폴더가 미적중일시 betting_total_result 처리
    // 폴더가 미적중일시 betting_total_odds 처리
    // 폴더가 미적중일시 betting_expected_prize 처리

    // 베팅폴더가 전부 적중일시 당첨금 지급
    // 폴더가 미적중일시 betting_expected_prize 처리
    // 폴더가 미적중일시 betting_payed_admin 처리
    // 폴더가 미적중일시 betting_payed_amount 처리
    // 폴더가 미적중일시 betting_payed_agent 처리

    // 정산시 상위회원에 대한 정산로직 ex.낙첨금
    this.logger.debug('베팅 정산 시작');

    const updateQuery = [];
    const createCash = [];
    const bettings = await this.bettingService.findAll({
      relations: ['bets'],
      where: [{ betting_result: 'wait' }, { betting_total_result: 'wait' }],
    });

    // 정산이 안된 베팅들을 불러오고
    for (const b in bettings) {
      const bet = bettings[b];

      // 경기가 취소되었을시
      if (bet.bets.bets_status === 'cancelled') {
        bet.betting_total_odds = String(
          Number(bet.betting_total_odds) / Number(bet.betting_odds),
        );

        bet.betting_expected_prize = String(
          Number(bet.betting_total_odds) * Number(bet.betting_bet_amount),
        );

        bet.betting_result = 'exception';
        const val = {
          betting_total_odds: bet.betting_total_odds,
          betting_expected_prize: bet.betting_expected_prize,
        };
        updateQuery.push(
          await this.bettingService.updateByBetcode(bet.betting_betcode, val),
        );
        // await this.bettingService.updateByBetcode(bet.betting_betcode, val);
      } else {
        bet.betting_result =
          bet.bets.bets_settlement === 'win' ? 'hit' : 'miss';
      }

      updateQuery.push(await this.bettingService.save(bet));
      // await this.bettingService.save(bet);

      const relationBettings = bettings.filter(
        (e) => e.betting_betcode === bet.betting_betcode,
      );

      const results = relationBettings.map((e) => e.betting_result);

      // 해당 베팅폴더 전체 업데이트
      if (results.indexOf('miss') !== -1) {
        // 낙첨
        const val = {
          betting_total_result: 'miss',
          betting_payed: 'y',
        };
        updateQuery.push(
          await this.bettingService.updateByBetcode(bet.betting_betcode, val),
        );
        // await this.bettingService.updateByBetcode(bet.betting_betcode, val);
        // 상위파트너에 포인트 지급 필요
        const parents = await this.membersService.getAllParents(bet.member);
        let prevResult = 0;
        for (const p in parents) {
          const parent = parents[p];
          if (parent.members_parent !== 0) {
            const ratio = parent.members_partner_setting.정산비율.스포츠;
            let totalRemain = Math.ceil(bet.betting_bet_amount * (ratio / 100));
            totalRemain = totalRemain - prevResult;
            parent.members_point += totalRemain;

            createCash.push({
              cash_member: parent.members_seq,
              cash_amount: Number(totalRemain),
              cash_detail_type: '배당',
              cash_type: '입금',
              cash_status: '처리완료',
              cash_betcode: bet.betting_betcode,
              cash_sitename: bet.betting_sitename,
              cash_memo: `${bet.member.members_nickname} 낙첨금`,
              cash_done_datetime: new Date(),
              cash_done_by: 0,
            });
            // await this.cashService.create({
            //   cash_member: parent.members_seq,
            //   cash_amount: Number(totalRemain),
            //   cash_detail_type: '배당',
            //   cash_type: '입금',
            //   cash_status: '처리완료',
            //   cash_betcode: bet.betting_betcode,
            //   cash_sitename: bet.betting_sitename,
            //   cash_memo: `${bet.member.members_nickname} 낙첨금`,
            //   cash_done_datetime: new Date(),
            //   cash_done_by: 0,
            // });
            prevResult += totalRemain;
            updateQuery.push(await this.membersService.save(parent));
            // await this.membersService.save(parent);
          }
        }
        // 레벨에 따른 낙첨금 지급
      } else if (results.indexOf('wait') !== -1) {
        continue;
      } else {
        // 당첨
        const val = {
          betting_total_result: 'hit',
          betting_payed_amount: bet.betting_expected_prize,
          betting_payed: 'y',
        };
        updateQuery.push(
          await this.bettingService.updateByBetcode(bet.betting_betcode, val),
        );
        await this.bettingService.updateByBetcode(bet.betting_betcode, val);
        // 당첨금 지급
        // 로그기록
        // await this.cashService.create({
        //   cash_member: bet.betting_member,
        //   cash_amount: Number(bet.betting_expected_prize),
        //   cash_detail_type: '당첨',
        //   cash_type: '입금',
        //   cash_status: '처리완료',
        //   cash_betcode: bet.betting_betcode,
        //   cash_sitename: bet.betting_sitename,
        // });

        createCash.push({
          cash_member: bet.betting_member,
          cash_amount: Number(bet.betting_expected_prize),
          cash_detail_type: '당첨',
          cash_type: '입금',
          cash_status: '처리완료',
          cash_betcode: bet.betting_betcode,
          cash_sitename: bet.betting_sitename,
        });
        bet.member.members_point += Number(bet.betting_expected_prize);
        updateQuery.push(await this.membersService.save(bet.member));
        // await this.membersService.save(bet.member);
      }
    }
    await Promise.all([
      await this.cashService.insertMany(createCash),
      updateQuery,
    ]);
    this.logger.debug('베팅 정산 종료');
  }

  // @Interval(30000)
  // async taskCalcMini() {
  //   const updateQuery = [];
  //   const createCash = [];
  //   this.logger.debug('미니게임 정산 시작');
  //
  //   const bettings = await this.bettingService.findAll({
  //     relations: ['betting.bets'],
  //     where: {
  //       betting_result: 'wait',
  //       folder: {
  //         folders_type: '미니게임',
  //         folders_result: Not('wait'),
  //         game: { game_status: '종료' },
  //       },
  //     },
  //   });
  //   // 정산이 안된 베팅들을 불러오고
  //
  //   for (const b in bettings) {
  //     const bet = bettings[b];
  //
  //     if (bet.bets.bets_status === 'cancelled') {
  //       bet.betting_total_odds = String(
  //         Number(bet.betting_total_odds) / Number(bet.betting_odds),
  //       );
  //
  //       bet.betting_expected_prize = String(
  //         Number(bet.betting_total_odds) * Number(bet.betting_bet_amount),
  //       );
  //
  //       bet.betting_result = 'exception';
  //       const val = {
  //         betting_total_odds: bet.betting_total_odds,
  //         betting_expected_prize: bet.betting_expected_prize,
  //       };
  //
  //       updateQuery.push(
  //         await this.bettingService.updateByBetcode(bet.betting_betcode, val),
  //       );
  //       // await this.bettingService.updateByBetcode(bet.betting_betcode, val);
  //     } else {
  //       bet.betting_result =
  //         bet.bets.bets_settlement === 'win' ? 'hit' : 'miss';
  //     }
  //
  //     await this.bettingService.save(bet);
  //
  //     const relationBettings = bettings.filter(
  //       (e) => e.betting_betcode === bet.betting_betcode,
  //     );
  //
  //     const results = relationBettings.map((e) => e.betting_result);
  //
  //     // 해당 베팅폴더 전체 업데이트
  //     if (results.indexOf('miss') !== -1) {
  //       // 낙첨
  //       const val = {
  //         betting_total_result: 'miss',
  //         betting_payed: 'y',
  //       };
  //
  //       updateQuery.push(
  //         await this.bettingService.updateByBetcode(bet.betting_betcode, val),
  //       );
  //       // await this.bettingService.updateByBetcode(bet.betting_betcode, val);
  //       // 상위파트너에 포인트 지급 필요
  //       const parents = await this.membersService.getAllParents(bet.member);
  //       let prevResult = 0;
  //       for (const p in parents) {
  //         const parent = parents[p];
  //         if (parent.members_parent !== 0) {
  //           const ratio = parent.members_partner_setting.정산비율.미니게임;
  //           let totalRemain = Math.ceil(bet.betting_bet_amount * (ratio / 100));
  //           totalRemain = totalRemain - prevResult;
  //           parent.members_point += totalRemain;
  //
  //           createCash.push({
  //             cash_member: parent.members_seq,
  //             cash_amount: Number(totalRemain),
  //             cash_detail_type: '배당',
  //             cash_type: '입금',
  //             cash_status: '처리완료',
  //             cash_betcode: bet.betting_betcode,
  //             cash_sitename: bet.betting_sitename,
  //             cash_memo: `회원 ${bet.member.members_nickname} 낙첨금`,
  //           });
  //           // await this.cashService.create({
  //           //   cash_member: parent.members_seq,
  //           //   cash_amount: Number(totalRemain),
  //           //   cash_detail_type: '배당',
  //           //   cash_type: '입금',
  //           //   cash_status: '처리완료',
  //           //   cash_betcode: bet.betting_betcode,
  //           //   cash_sitename: bet.betting_sitename,
  //           //   cash_memo: `회원 ${bet.member.members_nickname} 낙첨금`,
  //           // });
  //           prevResult += totalRemain;
  //           // await this.membersService.save(parent);
  //           updateQuery.push(await this.membersService.save(parent));
  //         }
  //       }
  //       // 레벨에 따른 낙첨금 지급
  //     } else if (results.indexOf('wait') !== -1) {
  //       continue;
  //     } else {
  //       // 당첨
  //       const val = {
  //         betting_total_result: 'hit',
  //         betting_payed_amount: bet.betting_expected_prize,
  //         betting_payed: 'y',
  //       };
  //       updateQuery.push(
  //         await this.bettingService.updateByBetcode(bet.betting_betcode, val),
  //       );
  //       // await this.bettingService.updateByBetcode(bet.betting_betcode, val);
  //       // 당첨금 지급
  //       // 로그기록
  //
  //       createCash.push({
  //         cash_member: bet.betting_member,
  //         cash_amount: Number(bet.betting_expected_prize),
  //         cash_detail_type: '당첨',
  //         cash_type: '입금',
  //         cash_status: '처리완료',
  //         cash_betcode: bet.betting_betcode,
  //         cash_sitename: bet.betting_sitename,
  //       });
  //       // await this.cashService.create({
  //       //   cash_member: bet.betting_member,
  //       //   cash_amount: Number(bet.betting_expected_prize),
  //       //   cash_detail_type: '당첨',
  //       //   cash_type: '입금',
  //       //   cash_status: '처리완료',
  //       //   cash_betcode: bet.betting_betcode,
  //       //   cash_sitename: bet.betting_sitename,
  //       // });
  //       bet.member.members_point += Number(bet.betting_expected_prize);
  //       updateQuery.push(await this.membersService.save(bet.member));
  //       // await this.membersService.save(bet.member);
  //     }
  //   }
  //   await Promise.all([
  //     await this.cashService.insertMany(createCash),
  //     updateQuery,
  //   ]);
  //   this.logger.debug('미니게임 정산 종료');
  // }
}

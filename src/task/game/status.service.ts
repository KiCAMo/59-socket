import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { CacheService } from '../../cache/cache.service';
import { CrawlerService } from '../../crawler/crawler.service';
import { BetsService } from '../../core/bets/bets.service';
import { GameService } from '../../core/game/game.service';

@Injectable()
export class GameStatusService {
  private readonly logger = new Logger(GameStatusService.name);

  constructor(
    private gameService: GameService,
    private betsService: BetsService,
    private cacheService: CacheService,
    private crawlerService: CrawlerService,
  ) {}

  // 대기가 아닌게임 상태 업데이트
  @Interval(60000)
  async updateGame() {
    this.logger.log('대기상태 게임 진행중으로 변경');
    // 1. 대기 아닌 상태업데이트 진행중으로 변경
    await this.gameService.updateWaiting();
  }

  // @Interval(60000)
  async statusChange() {
    this.logger.log('진행중인 게임 종류 구분 종료된 경기 옮김');
    // 1. 진행중인경기들 중 종료된 경기 구분 종료경기로 옮김
    // 2. 진행중인경기들 lsports 조회요청
    let playingGameList: any = await this.cacheService.getKey(
      'playingGameList',
    );
    if (!playingGameList) playingGameList = [];

    let endGameList: any = await this.cacheService.getKey('endGameList');
    if (!endGameList) endGameList = [];
    const slicePlayingGameList = playingGameList.slice(1, 100);
    const ids = slicePlayingGameList.map((e) => e.game_id);
    let fixturesIds = '';
    for (const g in ids) {
      if (fixturesIds) fixturesIds += ',';
      fixturesIds += ids[g];
    }
    const result = await this.crawlerService.getIdsByGames(fixturesIds);
    const data = result.data;

    if (data.Body) {
      const games = data.Body;
      // 진행상태 게임들 정보 있으면
      for (const g in games) {
        const 게임 = games[g];
        const listItem = playingGameList.find(
          (e) => e.game_id === String(게임.FixtureId),
        );

        // 해당정보가 있을때
        // 경기상태가 종료 진행 및 대기가 아니면 디비입력 및 메모리에서 삭제
        if (listItem) {
          const 상태 = this.crawlerService.gameStatus(게임.Fixture.Status);
          if (상태 === '종료' || 상태 === '취소' || 상태 === '연기') {
            listItem.game_status = 상태;

            const index = playingGameList.findIndex(
              (e) => e.game_id === listItem.game_id,
            );

            playingGameList.splice(index, 1);
            endGameList.push(listItem);
          }
        }
      }
    }

    // await this.cacheService.delKey('playingGameList');
    await this.cacheService.setKey('playingGameList', playingGameList);

    // await this.cacheService.delKey('endGameList');
    await this.cacheService.setKey('endGameList', endGameList);
  }

  @Interval(60000)
  async endGameRegister() {
    this.logger.log('종료된 경기 옮김');
    // 1. 진행중인경기들 중 종료된 경기 구분 DB에 입력
    // 2. 진행중인경기들 lsports 조회요청
    // 3. 종료된 경기들 DB에 입력
    const updateBets = [];
    const gameUpdate = [];
    const endGames = await this.gameService.findAll({
      where: { game_status: '진행', game_type: '스포츠' },
      // relations: ['folders', 'folders.bets'],
      take: 50,
    });
    const ids = endGames.map((e) => e.game_id);
    let fixturesIds = '';
    for (const g in ids) {
      if (fixturesIds) fixturesIds += ',';
      fixturesIds += ids[g];
    }
    const result = await this.crawlerService.getIdsByGame(fixturesIds);
    const data = result.data;

    if (data.Body) {
      const games = data.Body;
      // 진행상태 게임들 정보 있으면
      for (const g in games) {
        const 게임 = games[g];
        const listItem = endGames.find(
          (e) => String(e.game_id) === String(게임.FixtureId),
        );
        // 해당정보가 있을때
        if (listItem) {
          const gameStatus = this.crawlerService.gameStatus(
            게임.Fixture.Status,
          );
          listItem.game_status = gameStatus;
          if (
            gameStatus === '종료' ||
            gameStatus === '취소' ||
            gameStatus === '연기'
          ) {
            if (listItem.folders) {
              for (const f in listItem.folders) {
                const folders = listItem.folders[f];
                for (const b in folders.bets) {
                  updateBets.push(folders.bets[b]);
                }
              }
            }
            delete listItem.folders;
            gameUpdate.push(listItem);
          }
        }
      }

      const ids = gameUpdate.map((e) => e.game_id);
      let endFixturesIds = '';
      for (const g in ids) {
        if (endFixturesIds) endFixturesIds += ',';
        endFixturesIds += ids[g];
      }
      const result2 = await this.crawlerService.getIdsByGameMarket(
        endFixturesIds,
      );
      const data2 = result2.data;
      if (data2.Body) {
        const games = data2.Body;
        for (const g in games) {
          const 게임 = games[g];

          if (게임.Markets) {
            const 마켓들 = 게임.Markets;
            for (const m in 마켓들) {
              const 마켓 = 마켓들[m];
              const 제공업체들 = 마켓.Providers;
              for (const p in 제공업체들) {
                const 제공업체 = 제공업체들[p];

                for (const b in 제공업체.Bets) {
                  const bets = updateBets.find(
                    (e) =>
                      e.bets_id === 제공업체.Bets[b].Id &&
                      e.bets_name === 제공업체.Bets[b].Name,
                  );
                  if (bets) {
                    bets.bets_status = this.crawlerService.betsStatus(
                      제공업체.Bets[b].Status,
                    );
                    bets.bets_settlement = this.crawlerService.betSettlement(
                      제공업체.Bets[b].Settlement,
                    );
                    updateBets.push(bets);
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(updateBets);
    if (updateBets.length > 0) {
      const wins = updateBets.filter((e) => e.bets_settlement === 'win');
      const winSeqs = wins.map((e) => e.bets_seq);
      if (winSeqs && winSeqs.length > 0) {
        await this.betsService.updateInSeq(winSeqs, {
          bets_settlement: 'win',
          bets_status: 'settled',
        });
      }

      const refund = updateBets.filter((e) => e.bets_settlement === 'refund');
      const refundSeqs = refund.map((e) => e.bets_seq);

      await this.betsService.updateInSeq(refundSeqs, {
        bets_settlement: 'refund',
        bets_status: 'settled',
      });

      const cancelleds = updateBets.filter(
        (e) => e.bets_settlement === 'cancelled',
      );
      const cancelledSeqs = cancelleds.map((e) => e.bets_seq);

      await this.betsService.updateInSeq(cancelledSeqs, {
        bets_settlement: 'cancelled',
        bets_status: 'settled',
      });
      const loses = updateBets.filter((e) => e.bets_settlement === 'lose');
      const loseSeqs = loses.map((e) => e.bets_seq);
      await this.betsService.updateInSeq(loseSeqs, {
        bets_settlement: 'lose',
        bets_status: 'settled',
      });
      const halfloses = updateBets.filter(
        (e) => e.bets_settlement === 'halflose',
      );
      const halfloseSeqs = halfloses.map((e) => e.bets_seq);
      await this.betsService.updateInSeq(halfloseSeqs, {
        bets_settlement: 'halflose',
        bets_status: 'settled',
      });
      const halfwins = updateBets.filter(
        (e) => e.bets_settlement === 'halfwin',
      );
      const halfwinSeqs = halfwins.map((e) => e.bets_seq);
      await this.betsService.updateInSeq(halfwinSeqs, {
        bets_settlement: 'halfwin',
        bets_status: 'settled',
      });
    }
    await this.gameService.updateBulk(gameUpdate);
    // await this.betsService.updateBulk(updateBets);
  }
}

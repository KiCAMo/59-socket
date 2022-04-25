import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { GameService } from '../../core/game/game.service';
import { CrawlerService } from '../../crawler/crawler.service';
import { SitesService } from '../../core/sites/sites.service';

import { CacheService } from '../../cache/cache.service';
import { In, Not } from 'typeorm';

@Injectable()
export class InplayService {
  private readonly logger = new Logger(InplayService.name);

  constructor(
    private crawlerService: CrawlerService,
    private gameService: GameService,
    private sitesService: SitesService,
    private cacheService: CacheService,
  ) {}

  // 인플레이 경기 주문상태
  @Interval(60000)
  async getInPlayOrdered() {
    this.logger.log('인플레이 경기 가져오기');
    const orders = await this.crawlerService.reqInplayGame();
    const ordersResult = orders.data.FixtureOrders;
    const fixturesIds = ordersResult.map((e) => e.FixtureId);
    let gameList: any = await this.cacheService.getKey('inplayList');
    // console.log(fixturesIds);
    if (!gameList) gameList = [];

    gameList = await this.gameService.findAll({
      where: {
        game_id: In(fixturesIds),
        game_status: Not('종료'),
      },
      relations: ['home_team', 'away_team', 'league', 'sport', 'location'],
    });
    // console.log(gameList);
    await this.cacheService.setKey('inplayList', gameList);
  }

  // 인플레이 경기 가져오기
  // @Interval(60000)
  async getInPlay() {
    this.logger.log('인플레이 폴더 가져오기');

    let gameList: any = await this.cacheService.getKey('inplayList');
    // console.log(fixturesIds);
    if (!gameList) gameList = [];

    let snapshotId = '';
    for (const i in gameList) {
      if (Number(i) === gameList.length - 1) {
        snapshotId += `${gameList[i].game_id}`;
      } else {
        snapshotId += `${gameList[i].game_id},`;
      }
    }

    const folders = await this.crawlerService.reqInplayFolders(snapshotId);
    const data = folders.data;
    const sites = await this.sitesService.findAll();
    for (const s in sites) {
      const site = sites[s];
      const sitename = site.sites_name;
      console.log(site);
      // const settings = site.sites_settings;
      // 테스트로 vikbet만
      // const minusRatio = JSON.parse(settings).sportConfig.common.base;

      if (data.Body) {
        const games = data.Body;
        for (const g in games) {
          const 게임 = games[g];
          const selectProvi = [4, 13, 74, 145, 8];

          // 인메모리에서 게임 정보 있으면 redis에 입력
          const listItem = gameList.find(
            (e) => e.game_id === String(게임.FixtureId),
          );

          if (listItem) {
            if (게임.Markets) {
              // 마켓데이터 순회
              const 마켓들 = 게임.Markets;
              for (const m in 마켓들) {
                const 마켓 = 마켓들[m];
                const 제공업체들 = 마켓.Providers;

                if (!listItem.folders) {
                  listItem.folders = [];
                }

                // 게임리스트에서 해당게임이있는지 있으면 folders에 입력
                for (const p in 제공업체들) {
                  const 제공업체 = 제공업체들[p];
                  if (selectProvi.indexOf(제공업체.Id) !== -1) {
                    if (마켓.Name.indexOf('1X2') !== -1) {
                      const bets = [];
                      let folderStatus = null;

                      const 승 = 제공업체.Bets.find((e) => e.Name === '1');
                      const 무 = 제공업체.Bets.find((e) => e.Name === 'X');
                      const 패 = 제공업체.Bets.find((e) => e.Name === '2');

                      folderStatus = 승.Status;

                      for (const b in 제공업체.Bets) {
                        if (승 && 무 && 패) {
                          const det = {
                            bets_id: 제공업체.Bets[b].Id,
                            bets_name: 제공업체.Bets[b].Name,
                            bets_line: null,
                            bets_status: 제공업체.Bets[b].Status,
                            bets_price: Number(제공업체.Bets[b].Price).toFixed(
                              2,
                            ),
                            bets_start_price: 제공업체.Bets[b].StartPrice,
                            bets_settlement: 제공업체.Bets[b].Settlement
                              ? this.crawlerService.betSettlement(
                                  제공업체.Bets[b].Settlement,
                                )
                              : 'wait',
                          };
                          bets.push(det);
                        }
                      }

                      const folder = listItem.folders.find(
                        (e) =>
                          e.folders_market === 마켓.Id &&
                          e.folders_bookmaker === 제공업체.Id,
                      );

                      if (folder) {
                        folder.folders_status = folderStatus;
                        folder.bets = bets;
                      } else {
                        listItem.folders.push({
                          folders_id: `${게임.FixtureId}${마켓.Id}${
                            제공업체.Id
                          }${제공업체.Id}${Math.floor(Math.random() * 100000)}`,
                          folders_game: 게임.FixtureId,
                          folders_market: 마켓.Id,
                          folders_bookmaker: 제공업체.Id,
                          folders_type: '인플레이',
                          folders_status: folderStatus,
                          markets: { markets_name_en: 마켓.Name },
                          bets,
                          folders_sites: sitename,
                        });
                      }
                    }
                    if (마켓.Name.indexOf('12') !== -1) {
                      const bets = [];
                      let folderStatus = null;

                      const 승 = 제공업체.Bets.find((e) => e.Name === '1');
                      const 패 = 제공업체.Bets.find((e) => e.Name === '2');
                      folderStatus = 승.Status;

                      for (const b in 제공업체.Bets) {
                        if (승 && 패) {
                          const det = {
                            bets_id: 제공업체.Bets[b].Id,
                            bets_name: 제공업체.Bets[b].Name,
                            bets_line: null,
                            bets_status: 제공업체.Bets[b].Status,
                            bets_price: Number(제공업체.Bets[b].Price).toFixed(
                              2,
                            ),
                            bets_start_price: 제공업체.Bets[b].StartPrice,
                            bets_settlement: 제공업체.Bets[b].Settlement
                              ? this.crawlerService.betSettlement(
                                  제공업체.Bets[b].Settlement,
                                )
                              : 'wait',
                          };
                          bets.push(det);
                        }
                      }

                      const folder = listItem.folders.find(
                        (e) =>
                          e.folders_market === 마켓.Id &&
                          e.folders_bookmaker === 제공업체.Id,
                      );

                      if (folder) {
                        folder.folders_status = folderStatus;
                        folder.bets = bets;
                      } else {
                        listItem.folders.push({
                          folders_id: `${게임.FixtureId}${마켓.Id}${
                            제공업체.Id
                          }${제공업체.Id}${Math.floor(Math.random() * 100000)}`,
                          folders_game: 게임.FixtureId,
                          folders_market: 마켓.Id,
                          folders_bookmaker: 제공업체.Id,
                          folders_type: '인플레이',
                          folders_status: folderStatus,
                          markets: { markets_name_en: 마켓.Name },
                          bets,
                          folders_sites: sitename,
                        });
                      }
                    }
                    if (마켓.Name.indexOf('Handicap') !== -1) {
                      let 기준점s = 제공업체.Bets.map((e) => e.BaseLine);
                      기준점s = Array.from(new Set(기준점s));
                      for (const ki in 기준점s) {
                        const bets = [];
                        const 기준점 = 기준점s[ki];
                        if (
                          기준점.indexOf('.25') === -1 &&
                          기준점.indexOf('.75') === -1
                        ) {
                          const 배당 = 제공업체.Bets.filter(
                            (e) => e.BaseLine === 기준점,
                          );
                          // console.log(배당);

                          const home = 배당.find((e) => e.Name === '1');
                          const away = 배당.find((e) => e.Name === '2');

                          for (const b in 배당) {
                            if (home && away) {
                              const det = {
                                bets_id: 배당[b].Id,
                                bets_name: 배당[b].Name,
                                bets_line: 기준점,
                                bets_status: 배당[b].Status,
                                bets_price: Number(
                                  제공업체.Bets[b].Price,
                                ).toFixed(2),
                                bets_start_price: 제공업체.Bets[b].StartPrice,
                                bets_settlement: 배당[b].Settlement
                                  ? this.crawlerService.betSettlement(
                                      배당[b].Settlement,
                                    )
                                  : 'wait',
                              };
                              bets.push(det);
                            }
                          }

                          const folder = listItem.folders.find(
                            (e) =>
                              e.folders_market === 마켓.Id &&
                              e.folders_bookmaker === 제공업체.Id &&
                              e.folders_line === 기준점,
                          );

                          if (folder) {
                            folder.folders_status = home ? home.Status : 2;
                            folder.bets = bets;
                          } else {
                            listItem.folders.push({
                              folders_id: `${게임.FixtureId}${마켓.Id}${
                                제공업체.Id
                              }${제공업체.Id}${Math.floor(
                                Math.random() * 100000,
                              )}`,
                              folders_game: 게임.FixtureId,
                              folders_market: 마켓.Id,
                              folders_bookmaker: 제공업체.Id,
                              folders_type: '인플레이',
                              folders_line: 기준점,
                              folders_status: home ? home.Status : 2,
                              markets: { markets_name_en: 마켓.Name },
                              bets,
                              folders_sites: sitename,
                            });
                          }
                        }
                      }
                    }
                    if (마켓.Name.indexOf('Under/Over') !== -1) {
                      let 기준점s = 제공업체.Bets.map((e) => e.BaseLine);
                      기준점s = Array.from(new Set(기준점s));
                      for (const ki in 기준점s) {
                        const bets = [];
                        const 기준점 = 기준점s[ki];
                        const 배당 = 제공업체.Bets.filter(
                          (e) => e.BaseLine === 기준점,
                        );
                        const home = 배당.find((e) => e.Name === 'Over');
                        const away = 배당.find((e) => e.Name === 'Under');
                        if (home && away) {
                          for (const b in 배당) {
                            if (
                              home &&
                              away &&
                              home.Price !== '1.00' &&
                              away.Price !== '1.00'
                            ) {
                              const det = {
                                bets_id: 배당[b].Id,
                                bets_name: 배당[b].Name,
                                bets_line: 기준점,
                                bets_status: 배당[b].Status,
                                bets_price: Number(배당[b].Price).toFixed(2),
                                bets_start_price: 제공업체.Bets[b].StartPrice,
                                bets_settlement: 배당[b].Settlement
                                  ? this.crawlerService.betSettlement(
                                      배당[b].Settlement,
                                    )
                                  : 'wait',
                              };
                              bets.push(det);
                            }
                          }

                          const folder = listItem.folders.find(
                            (e) =>
                              e.folders_market === 마켓.Id &&
                              e.folders_bookmaker === 제공업체.Id &&
                              e.folders_line === 기준점,
                          );

                          if (folder) {
                            folder.folders_status = home ? home.Status : 2;
                            folder.bets = bets;
                          } else {
                            const folderData = {
                              folders_id: `${게임.FixtureId}${마켓.Id}${
                                제공업체.Id
                              }${제공업체.Id}${Math.floor(
                                Math.random() * 100000,
                              )}`,
                              folders_game: 게임.FixtureId,
                              folders_market: 마켓.Id,
                              folders_bookmaker: 제공업체.Id,
                              folders_type: '인플레이',
                              folders_line: 기준점,
                              folders_status: home ? home.Status : 2,
                              markets: { markets_name_en: 마켓.Name },
                              bets,
                              folders_sites: sitename,
                            };
                            listItem.folders.push(folderData);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    await this.cacheService.setKey('inplayList', gameList);
  }
}

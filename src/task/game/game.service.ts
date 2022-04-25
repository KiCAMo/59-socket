import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { In, MoreThan } from 'typeorm';
import moment from 'moment';

import { CrawlerService } from '../../crawler/crawler.service';
import { TeamsService } from '../../core/teams/teams.service';
// import { LocationsService } from '../../core/locations/locations.service';
// import { SportsService } from '../../core/sports/sports.service';

import { CacheService } from '../../cache/cache.service';
import { GameService } from '../../core/game/game.service';
import { FoldersService } from '../../core/folders/folders.service';
import { BetsService } from '../../core/bets/bets.service';
// import { SitesService } from '../../core/sites/sites.service';
// import { MarketsService } from '../../core/markets/markets.service';

@Injectable()
export class GetGameService {
  private readonly logger = new Logger(GetGameService.name);

  constructor(
    private teamsService: TeamsService,
    private crawlerService: CrawlerService,
    private gameService: GameService,
    private foldersService: FoldersService,
    private betsService: BetsService,

    // private locationsService: LocationsService,
    // private sportsService: SportsService,
    private cacheService: CacheService, // private sitesService: SitesService, // private marketsService: MarketsService,
  ) {}

  // 게임 정보 가져오기
  @Interval(300000)
  async getGames() {
    this.logger.log('게임정보 크롤링 시작');
    const teams = await this.teamsService.findAll();
    const result = await this.crawlerService.usedFilterByGames();

    const data = result.data;
    const teamsInsertQuery = [];
    const gameInsertQuery = [];
    // const gameUpdateQuery = [];

    // 1. 게임정보 요청
    // 2. 게임정보 아이디만 정렬
    // 3. 데이터베이스에서 게임 정보를 한번에 불러온다
    if (data.Body) {
      // 게임 경기들
      const games = data.Body;
      const gameIds = games.map((e) => e.FixtureId);
      const reqAllGame = await this.gameService.findAll({
        where: {
          game_id: In(gameIds),
          // game_starttime: MoreThan(
          //   moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
          // ),
        },
        // relations: ['home_team', 'away_team', 'league', 'sport', 'location'],
      });
      for (const g in games) {
        const 게임 = games[g];
        const targetGame = reqAllGame.find(
          (e) => Number(e.game_id) === 게임.FixtureId,
        );
        const gameStatus = this.crawlerService.gameStatus(게임.Fixture.Status);

        // 해당경기가 DB에 있을ㄷ시
        if (!targetGame) {
          /*
          DB에 경기가 없을시
          해당경기를 생성
           *  */
          const homeTeam = 게임.Fixture.Participants.find(
            (e) => e.Position === '1',
          );

          const awayTeam = 게임.Fixture.Participants.find(
            (e) => e.Position === '2',
          );
          const homeTeams = teams.find((e) => e.teams_id === homeTeam.Id);
          if (!homeTeams) {
            teamsInsertQuery.push({
              teams_id: homeTeam.Id,
              teams_name_en: homeTeam.Name,
            });
          }

          const awayTeams = teams.find((e) => e.teams_id === awayTeam.Id);
          if (!awayTeams) {
            teamsInsertQuery.push({
              teams_id: awayTeam.Id,
              teams_name_en: awayTeam.Name,
            });
          }

          gameInsertQuery.push({
            game_id: 게임.FixtureId,
            game_sport: 게임.Fixture.Sport.Id,
            game_location: 게임.Fixture.Location.Id,
            game_league: 게임.Fixture.League.Id,
            game_starttime: moment(게임.Fixture.StartDate)
              .add(9, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            game_home_team: homeTeam.Id,
            game_away_team: awayTeam.Id,
            game_status: gameStatus,
            game_sites: '[]',
          });
        }
      }
    }

    await Promise.all([
      await this.gameService.insertMany(gameInsertQuery),
      await this.teamsService.insertMany(teamsInsertQuery),
      // await this.gameService.updateBulk(gameUpdateQuery),
    ]);
  }

  // 게임 정보 가져오기
  // @Interval(300000)
  async insertGameList() {
    this.logger.log('게임정보 입력 시작');
    let gameList: any = await this.cacheService.getKey('gameList');

    if (!gameList) gameList = [];

    // 1. 게임정보 요청
    // 2. 게임정보 아이디만 정렬
    // 3. 데이터베이스에서 게임 정보를 한번에 불러온다
    const reqAllGame = await this.gameService.findAll({
      where: {
        game_status: '대기',
        game_type: '스포츠',
        game_starttime: MoreThan(
          moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
        ),
      },
      relations: ['home_team', 'away_team', 'league', 'sport', 'location'],
    });

    for (const g in reqAllGame) {
      const 게임 = reqAllGame[g];
      const targetGame = gameList.find((e) => e.game_id === 게임.game_id);
      // REDIS 해당경기가 DB에 있을시
      if (!targetGame) {
        gameList.push(게임);
      }
    }
    // console.log(gameList);
    // await this.cacheService.delKey('gameList');
    await this.cacheService.setKey('gameList', gameList);

    // await this.cacheService.setKey('gameList', gameList, { ttl: 3600000 });
  }

  // 인메모리에 게임 정보등록
  @Interval(600000)
  async inMemoryGetFolders() {
    this.logger.log('게임정보에 폴더입력 시작');

    // let gameList: any = await this.cacheService.getKey('gameList');
    // if (!gameList) gameList = [];
    const result = await this.crawlerService.usedFilterByFolders();
    // 1. API 요청
    // 2. 해당 경기ID 들로 게임(폴더, 벳츠) 검색
    // 3. 해당 폴더가 있는지 검색
    const editingData = [];
    const insertFolder = [];
    const insertBets = [];
    // const updateBets = [];
    const data = result.data;
    if (data.Body) {
      const games = data.Body;
      const gamesId = games.map((e) => e.FixtureId);

      // 해당 폴더데이터에서 수정
      const dbData = await this.foldersService.findAll({
        where: {
          folders_game: In(gamesId),
        },
        relations: ['bets'],
      });

      // DB와 비교가능한 구조로 구조화
      for (const g in games) {
        const 게임 = games[g];

        const 스페셜마켓 = [21, 41, 42, 41, 64, 235, 236, 281, 202];

        if (게임.Markets) {
          // 마켓데이터 순회
          // 마켓은 = 폴더
          // 게임데이터 안에 폴더 내용이 있다면 업데이트
          const 마켓들 = 게임.Markets;
          for (const m in 마켓들) {
            const 마켓 = 마켓들[m];
            const 타입 =
              스페셜마켓.indexOf(마켓.Id) === -1 ? '프리매치' : '스페셜';
            const 제공업체들 = 마켓.Providers;

            // 게임리스트에서 해당게임이있는지 있으면 folders에 입력
            for (const p in 제공업체들) {
              const 제공업체 = 제공업체들[p];
              if (마켓.Name.indexOf('1X2') !== -1) {
                const bets = [];
                let folderStatus = null;

                const 승 = 제공업체.Bets.find((e) => e.Name === '1');
                const 무 = 제공업체.Bets.find((e) => e.Name === 'X');
                const 패 = 제공업체.Bets.find((e) => e.Name === '2');
                folderStatus = 승.Status;
                folderStatus = 승 ? 승.Status : 패 ? 패.Status : 무.Status;

                const newFolder: any = {
                  folders_game: 게임.FixtureId,
                  folders_market: 마켓.Id,
                  folders_bookmaker: 제공업체.Id,
                  folders_line: null,
                  folders_type: 타입,
                  folders_status: folderStatus,
                };

                for (const b in 제공업체.Bets) {
                  if (승 && 무 && 패) {
                    const det = {
                      bets_id: 제공업체.Bets[b].Id,
                      bets_name: 제공업체.Bets[b].Name,
                      bets_line: null,
                      bets_status: this.crawlerService.betsStatus(
                        제공업체.Bets[b].Status,
                      ),
                      bets_price: Number(제공업체.Bets[b].Price).toFixed(2),
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

                newFolder.bets = bets;
                editingData.push(newFolder);
              }
              if (마켓.Name.indexOf('12') !== -1) {
                const bets = [];
                let folderStatus = null;

                const 승 = 제공업체.Bets.find((e) => e.Name === '1');
                const 패 = 제공업체.Bets.find((e) => e.Name === '2');
                folderStatus = 승.Status;
                folderStatus = 승 ? 승.Status : 패.Status;

                const newFolder: any = {
                  folders_game: 게임.FixtureId,
                  folders_market: 마켓.Id,
                  folders_bookmaker: 제공업체.Id,
                  folders_type: 타입,
                  folders_line: null,
                  folders_status: folderStatus,
                };

                for (const b in 제공업체.Bets) {
                  if (승 && 패) {
                    const det = {
                      bets_id: 제공업체.Bets[b].Id,
                      bets_name: 제공업체.Bets[b].Name,
                      bets_line: null,
                      bets_status: this.crawlerService.betsStatus(
                        제공업체.Bets[b].Status,
                      ),
                      bets_price: Number(제공업체.Bets[b].Price).toFixed(2),
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

                newFolder.bets = bets;
                editingData.push(newFolder);
              }
              if (마켓.Name.indexOf('Handicap') !== -1) {
                let 기준점s = 제공업체.Bets.map((e) => e.BaseLine);
                기준점s = Array.from(new Set(기준점s));
                let foldersStatus = null;
                for (const ki in 기준점s) {
                  const bets = [];
                  const 기준점 = 기준점s[ki];
                  const 배당 = 제공업체.Bets.filter(
                    (e) => e.BaseLine === 기준점,
                  );
                  const home = 배당.find((e) => e.Name === '1');
                  const away = 배당.find((e) => e.Name === '2');
                  // console.log(배당, 456);
                  foldersStatus = home ? home.Status : away.Status;

                  const newFolder: any = {
                    folders_game: 게임.FixtureId,
                    folders_market: 마켓.Id,
                    folders_bookmaker: 제공업체.Id,
                    folders_type: 타입,
                    folders_line: 기준점,
                    folders_status: foldersStatus,
                  };

                  if (home && away) {
                    for (const b in 배당) {
                      if (
                        home &&
                        away &&
                        home.Price !== '1.00' &&
                        away.Price !== '1.00'
                      ) {
                        // console.log(배당[b], 배당[b].Status, 4567);

                        const det = {
                          bets_id: 배당[b].Id,
                          bets_name: 배당[b].Name,
                          bets_line: 기준점,
                          bets_status: this.crawlerService.betsStatus(
                            배당[b].Status,
                          ),
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
                  }

                  newFolder.bets = bets;
                  editingData.push(newFolder);
                }
              }
              if (마켓.Name.indexOf('Under/Over') !== -1) {
                let 기준점s = 제공업체.Bets.map((e) => e.BaseLine);
                기준점s = Array.from(new Set(기준점s));
                let foldersStatus = null;
                for (const ki in 기준점s) {
                  const bets = [];
                  const 기준점 = 기준점s[ki];
                  const 배당 = 제공업체.Bets.filter(
                    (e) => e.BaseLine === 기준점,
                  );
                  const home = 배당.find((e) => e.Name === 'Over');
                  const away = 배당.find((e) => e.Name === 'Under');
                  // console.log(배당, 456);
                  foldersStatus = home ? home.Status : away.Status;

                  const newFolder: any = {
                    folders_game: 게임.FixtureId,
                    folders_market: 마켓.Id,
                    folders_bookmaker: 제공업체.Id,
                    folders_type: 타입,
                    folders_line: 기준점,
                    folders_status: foldersStatus,
                  };

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
                          bets_status: this.crawlerService.betsStatus(
                            배당[b].Status,
                          ),
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
                  }

                  newFolder.bets = bets;
                  editingData.push(newFolder);
                }
              }
            }
          }
        }
      }

      // 구조된 데이터에서 업데이트
      for (const e in editingData) {
        const folder = editingData[e];
        // console.log(folder);
        if (folder.folders_line) {
          const dbFolder = dbData.find(
            (e) =>
              String(e.folders_game) === String(folder.folders_game) &&
              e.folders_market === folder.folders_market &&
              e.folders_bookmaker === folder.folders_bookmaker &&
              e.folders_line === folder.folders_line,
          );
          if (!dbFolder) {
            // 해당폴더가 없을때에는 폴더만 추가
            insertFolder.push(folder);
          } else {
            for (const b in folder.bets) {
              const bets = folder.bets[b];
              const dbBets = dbFolder.bets.find(
                (e) =>
                  Number(e.bets_id) === Number(bets.bets_id) &&
                  e.bets_name === bets.bets_name,
              );
              if (!dbBets) {
                bets.bets_folder = dbFolder.folders_seq;
                insertBets.push(bets);
              } else {
                if (
                  dbBets.bets_price !== bets.bets_price ||
                  dbBets.bets_status !== bets.bets_status
                ) {
                  dbBets.bets_start_price = bets.bets_start_price;
                  dbBets.bets_status = bets.bets_status;
                  dbBets.bets_price = bets.bets_price;
                  // updateBets.push(dbBets);
                }
              }
            }
          }
        } else {
          const dbFolder = dbData.find(
            (e) =>
              String(e.folders_game) === String(folder.folders_game) &&
              e.folders_market === folder.folders_market &&
              e.folders_bookmaker === folder.folders_bookmaker,
          );
          if (!dbFolder) {
            // 해당폴더가 없을때에는 폴더만 추가
            insertFolder.push(folder);
          } else {
            for (const b in folder.bets) {
              const bets = folder.bets[b];
              const dbBets = dbFolder.bets.find(
                (e) =>
                  Number(e.bets_id) === Number(bets.bets_id) &&
                  e.bets_name === bets.bets_name,
              );
              if (!dbBets) {
                bets.bets_folder = dbFolder.folders_seq;
                insertBets.push(bets);
              } else {
                if (
                  dbBets.bets_price !== bets.bets_price ||
                  dbBets.bets_status !== bets.bets_status
                ) {
                  dbBets.bets_start_price = bets.bets_start_price;
                  dbBets.bets_status = bets.bets_status;
                  dbBets.bets_price = bets.bets_price;
                  // updateBets.push(dbBets);
                }
              }
            }
          }
        }
      }
    }

    await this.foldersService.insertMany(insertFolder);
    await this.betsService.insertMany(insertBets);
    // await this.betsService.updateBulk(updateBets);
  }
}

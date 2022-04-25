import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import moment from 'moment';

import { GameService } from '../../core/game/game.service';
import { FoldersService } from '../../core/folders/folders.service';
import { CrawlerService } from '../../crawler/crawler.service';
import { BetsService } from '../../core/bets/bets.service';

// import moment from 'moment';

@Injectable()
export class MiniService {
  private readonly logger = new Logger(MiniService.name);

  constructor(
    private crawlerService: CrawlerService,
    private gameService: GameService,
    private foldersService: FoldersService,
    private betsService: BetsService,
  ) {}

  @Interval(15000)
  async getMiniGame() {
    const games = [
      {
        name: 'powerball',
        url: 'http://named.com/data/json/games/lottery/power_ball/result.json',
      },
      {
        name: 'powerladder',
        url: 'http://named.com/data/json/games/lottery/power_ladder/result.json',
      },
      // {"name":"kenoladder", "url":"http://named.com/data/json/games/lottery/keno_ladder/result.json"},
      //{"name":"powerfreekick", "url":"https://livescore.co.kr/sports/score_board/new_game/get_data_powerball_freekick.php?process=result&limit=1"},
      //{"name":"speedhomerun", "url":"https://livescore.co.kr/sports/score_board/new_game/get_data_speedkeno_homerun.php?process=result&limit=1"},
      //{"name":"powerspeeddunk", "url":"https://livescore.co.kr/sports/score_board/new_game/get_data_powerspeed_dunk.php?process=num_oe"}
    ];

    const folderInsert = [];
    const betsInsert = [];
    // const gameInSert = [];
    // const betsUpdate = [];
    // const gameUpdate = [];

    for (const i in games) {
      const now = new Date();
      const result = await this.crawlerService.getUrl(games[i].url);
      const data = result.data;
      let lastGameNo = 0;
      let gameNo = 0;
      let round = 0;
      let gameName = '';
      if (games[i].name === 'powerball') {
        lastGameNo = Number(data.times);
        gameNo = lastGameNo + 1;
        round = Number(data.date_round) + 1;
        gameName = games[i].name;
      } else if (
        games[i].name === 'powerladder' ||
        games[i].name === 'kenoladder'
      ) {
        lastGameNo = parseInt(data.r, 10);
        gameNo = Number(
          String(now.getFullYear()) +
            String(now.getMonth() + 1) +
            String(now.getDate()) +
            String(lastGameNo + 1),
        );
        lastGameNo = Number(
          String(now.getFullYear()) +
            String(now.getMonth() + 1) +
            String(now.getDate()) +
            String(lastGameNo),
        );
        round = data.r + 1;
        gameName = games[i].name;
      }

      // playstamp, playdatetime 계산
      let playStamp = 0;
      const theTime = new Date();
      const playTime = new Date(
        theTime.getFullYear(),
        theTime.getMonth(),
        theTime.getDate(),
        0,
        0,
        0,
      ); // 오늘 자정을 기준으로
      playTime.setSeconds(round * 300); // 게임회차*추첨간격을 산출하고
      if (theTime.getHours() == 0 && round > 288 - 1)
        playTime.setDate(playTime.getDate() - 1);
      playStamp = Number(playTime.getTime() / 1000); // 유닉스타임스탬프로 변환

      // 처리된 경기 외에 앞으로 진행할경기 동록확인
      const game = await this.gameService.findOneBy(
        { game_id: gameNo, game_type: '미니게임' },
        ['folders', 'folders.bets'],
      );
      if (gameName === 'powerball') {
        //있으면 업데이트
        if (game) {
          this.logger.debug('미니게임 지난회차 결과업데이트');
          //결과처리
          const lastGame = await this.gameService.findOneBy(
            { game_id: lastGameNo },
            ['folders', 'folders.bets'],
          );
          if (lastGame) {
            const ballsResult = data.ball; // 볼 결과
            const powerOeResult = data.pow_ball_oe; // 파워볼 홀짝
            const defOeResult = data.def_ball_oe; // 일반볼 홀짝
            const powerUOResult = data.pow_ball_unover; //파워볼 언더오버
            const defUOResult = data.def_ball_unover; //일반볼 언더오버
            const defSumResult = data.def_ball_sum; //일반볼 합
            const defDMSResult = data.def_ball_size; // 일반볼 대중소
            lastGame.game_result_home = String(ballsResult);
            lastGame.game_result_away = defSumResult;
            lastGame.game_status = '종료';
            const defOe = game.folders.find(
              (e) => e.folders_name === '일반볼(홀/짝)',
            );
            const powerOe = game.folders.find(
              (e) => e.folders_name === '파워볼(홀/짝)',
            );
            const defUO = game.folders.find(
              (e) => e.folders_name === '일반볼(언더/오버)',
            );
            const powerUO = game.folders.find(
              (e) => e.folders_name === '파워볼(언더/오버)',
            );
            const defDMS = game.folders.find(
              (e) => e.folders_name === '일반볼(소/중/대)',
            );

            for (const t in defOe.bets) {
              defOe.bets[t].bets_status = this.crawlerService.betsStatus(3);
              defOe.bets[t].bets_settlement =
                defOe.bets[t].bets_name === defOeResult ? 'win' : 'lose';

              await this.betsService.save(defOe.bets[t]);
            }

            for (const t in powerOe.bets) {
              powerOe.bets[t].bets_status = this.crawlerService.betsStatus(3);
              powerOe.bets[t].bets_settlement =
                powerOe.bets[t].bets_name === powerOeResult ? 'win' : 'lose';
              await this.betsService.save(powerOe.bets[t]);
            }

            for (const t in defUO.bets) {
              defUO.bets[t].bets_status = this.crawlerService.betsStatus(3);
              defUO.bets[t].bets_settlement =
                defUO.bets[t].bets_name === defUOResult ? 'win' : 'lose';

              await this.betsService.save(defUO.bets[t]);
            }

            for (const t in powerUO.bets) {
              powerUO.bets[t].bets_status = this.crawlerService.betsStatus(3);
              powerUO.bets[t].bets_settlement =
                powerUO.bets[t].bets_name === powerUOResult ? 'win' : 'lose';

              await this.betsService.save(powerUO.bets[t]);
            }

            for (const t in defDMS.bets) {
              defDMS.bets[t].bets_status = this.crawlerService.betsStatus(3);
              defDMS.bets[t].bets_settlement =
                defDMS.bets[t].bets_name === defDMSResult ? 'win' : 'lose';

              await this.betsService.save(defDMS.bets[t]);
            }
            await this.gameService.save(lastGame);
          }
        } else {
          this.logger.debug('미니게임 파워볼 등록');
          // 경기등록
          await this.gameService.create({
            game_type: '미니게임',
            game_starttime: moment(new Date(playStamp * 1000)).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
            game_id: gameNo,
            game_name: gameName,
            game_status: '대기',
            game_round: round,
          });

          const detail1 = {
            folders_detail: gameName,
            folders_type: '미니게임',
            folders_game: gameNo,
            folders_name: '일반볼(홀/짝)',
            folders_id: Number(`${gameNo}1`),
          };

          const bets11 = {
            bets_id: Number(`${gameNo}11`),
            bets_folder: Number(`${gameNo}1`),
            bets_name: `홀`,
            bets_price: `1.95`,
          };

          const bets12 = {
            bets_id: Number(`${gameNo}12`),
            bets_folder: Number(`${gameNo}1`),
            bets_name: `짝`,
            bets_price: `1.95`,
          };
          folderInsert.push(detail1);
          betsInsert.push(bets11);
          betsInsert.push(bets12);

          const detail2 = {
            folders_detail: gameName,
            folders_type: '미니게임',
            folders_game: gameNo,
            folders_name: '파워볼(홀/짝)',
            folders_id: Number(`${gameNo}2`),
          };

          const bets21 = {
            bets_id: Number(`${gameNo}21`),
            bets_folder: Number(`${gameNo}2`),
            bets_name: `홀`,
            bets_price: `1.95`,
          };

          const bets22 = {
            bets_id: Number(`${gameNo}22`),
            bets_folder: Number(`${gameNo}2`),
            bets_name: `짝`,
            bets_price: `1.95`,
          };
          folderInsert.push(detail2);
          betsInsert.push(bets21);
          betsInsert.push(bets22);

          const detail3 = {
            folders_detail: gameName,
            folders_type: '미니게임',
            folders_game: gameNo,
            folders_name: '일반볼(언더/오버)',
            folders_id: Number(`${gameNo}3`),
          };

          const bets31 = {
            bets_id: Number(`${gameNo}31`),
            bets_folder: Number(`${gameNo}3`),
            bets_name: `언더`,
            bets_price: `1.95`,
          };

          const bets32 = {
            bets_id: Number(`${gameNo}32`),
            bets_folder: Number(`${gameNo}3`),
            bets_name: `오버`,
            bets_price: `1.95`,
          };
          folderInsert.push(detail3);
          betsInsert.push(bets31);
          betsInsert.push(bets32);

          const detail4 = {
            folders_detail: gameName,
            folders_type: '미니게임',
            folders_game: gameNo,
            folders_name: '파워볼(언더/오버)',
            folders_id: Number(`${gameNo}4`),
          };

          const bets41 = {
            bets_id: Number(`${gameNo}41`),
            bets_folder: Number(`${gameNo}4`),
            bets_name: `언더`,
            bets_price: `1.95`,
          };

          const bets42 = {
            bets_id: Number(`${gameNo}42`),
            bets_folder: Number(`${gameNo}4`),
            bets_name: `오버`,
            bets_price: `1.95`,
          };
          folderInsert.push(detail4);
          betsInsert.push(bets41);
          betsInsert.push(bets42);

          const detail5 = {
            folders_detail: gameName,
            folders_type: '미니게임',
            folders_game: gameNo,
            folders_name: '일반볼(소/중/대)',
            folders_id: Number(`${gameNo}5`),
          };

          const bets51 = {
            bets_id: Number(`${gameNo}51`),
            bets_folder: Number(`${gameNo}5`),
            bets_name: `소`,
            bets_price: `1.95`,
          };

          const bets52 = {
            bets_id: Number(`${gameNo}52`),
            bets_folder: Number(`${gameNo}5`),
            bets_name: `중`,
            bets_price: `1.95`,
          };

          const bets53 = {
            bets_id: Number(`${gameNo}53`),
            bets_folder: Number(`${gameNo}5`),
            bets_name: `대`,
            bets_price: `1.95`,
          };
          folderInsert.push(detail5);
          betsInsert.push(bets51);
          betsInsert.push(bets52);
          betsInsert.push(bets53);
        }
      }
    }
    await Promise.all([
      await this.foldersService.insertMany(folderInsert),
      await this.betsService.insertMany(betsInsert),
    ]);
  }
}

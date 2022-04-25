import EventEmitter from 'events';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import {
  connect,
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';

import { Channel, Message, Connection } from 'amqplib';
import { v4 } from 'uuid';

import { LoggerService } from '../logger/logger.service';

import {
  IRMQModuleOptions,
  IRMQConnection,
  RMQ_MODULE_OPTIONS,
  RMQ_REPLY_QUEUE,
  ERROR_EVENT,
  DISCONNECT_EVENT,
  CONNECT_EVENT,
  // IRMQHandler,
  // TRMQResponse,
} from './rmq.constants';
// import { RmqExplorer } from './inplayRmq.explorer';

import config from 'config';
import axios from 'axios';
import { CacheService } from '../cache/cache.service';
import { SocketGateway } from '../socket/socket.gateway';
import { CrawlerService } from '../crawler/crawler.service';
const appSettings = config.get<IRabbitMQSettings>('RABBITMQ_SETTINGS');

@Injectable()
export class RmqService implements OnModuleInit {
  protected server: AmqpConnectionManager;
  protected connection: Connection;
  protected client_channel: ChannelWrapper;
  protected subscription_channel: ChannelWrapper;
  protected send_response_emmiter: EventEmitter = new EventEmitter();

  constructor(
    @Inject(RMQ_MODULE_OPTIONS) private readonly options: IRMQModuleOptions,
    private readonly logger: LoggerService,
    private cacheService: CacheService,
    private crawlerService: CrawlerService,
    private socket: SocketGateway,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async onModuleInit() {
    const url = `https://inplay.lsports.eu/api/Package/EnablePackage?username=${appSettings.username}&password=${appSettings.password}&packageid=${appSettings.INPLAY_LSPORTS_PID}`;
    await axios.get(url);

    const connection_uri = this.createConnectionUri(this.options.connection);

    const connection_options = {
      reconnectTimeInSeconds: this.options.reconnectTimeInSeconds ?? 5,
      heartbeatIntervalInSeconds: this.options.heartbeatIntervalInSeconds ?? 5,
    };

    this.server = connect([connection_uri], connection_options);

    this.server.on(CONNECT_EVENT, (connection: Connection) => {
      this.connection = connection;

      this.logger.info('RMQModule connected');
    });

    this.server.addListener(ERROR_EVENT, (err: unknown) => {
      this.logger.error(err);
    });

    this.server.addListener(DISCONNECT_EVENT, (err: any) => {
      this.logger.error(err);

      this.close();
    });

    await Promise.all([
      // this.createSubscriptionChannel(),
      this.createClientChannel(),
    ]);

    this.logger.info('RMQModule dependencies initialized');
  }

  private createConnectionUri(connection: IRMQConnection): string {
    let uri = `amqp://${connection.login}:${connection.password}@${connection.host}`;

    if (connection.port) {
      uri += `:${connection.port}`;
    }

    if (connection.vhost) {
      uri += `/${connection.vhost}`;
    }

    return uri;
  }

  private async createClientChannel() {
    this.client_channel = this.server.createChannel({
      json: false,
      setup: async (channel: Channel) => {
        await channel.consume(
          '_4079_',
          async (msg: Message) => {
            const JsonMsg = JSON.parse(msg.content.toString());
            const bookmakers = [4, 8, 13, 74, 145];
            if (JsonMsg.Body) {
              const jsonData = JsonMsg.Body;
              if (jsonData.Events) {
                const events = jsonData.Events;
                // 업데이트를 위한 구조화
                this.socket.allUserSend({ name: 'inplayData', data: events });

                const data = {
                  gameId: null,
                  gameStatus: null,
                  marketId: null,
                  providerId: null,
                  score: null,
                  odds: [],
                };
                for (const i in events) {
                  // 픽스쳐 아이디
                  const gameId = events[i].FixtureId;
                  const 게임ID = String(gameId);
                  data.gameId = 게임ID;

                  // 경기상태에대한 정보
                  if (events[i].Fixture) {
                    data.gameStatus = this.crawlerService.gameStatus(
                      events[i].Fixture.Status,
                    );
                  }

                  // 경기 스코어 대한 정보
                  if (events[i].Livescore) {
                    const score: any = {};
                    score.period = events[i].Livescore.Scoreboard.CurrentPeriod;
                    score.time = events[i].Livescore.Scoreboard.Time;
                    // data.score.home =
                    const home = events[i].Livescore.Scoreboard.Results.find(
                      (e) => e.Position === '1',
                    );
                    const away = events[i].Livescore.Scoreboard.Results.find(
                      (e) => e.Position === '2',
                    );
                    score.home = home.Value;
                    score.away = away.Value;
                    data.score = score;
                  }

                  const markets = events[i].Markets;
                  if (markets) {
                    for (const j in markets) {
                      // console.log(markets[j]);
                      // 마켓아이디 추가
                      const marketId = markets[j].Id;
                      const marketName = markets[j].Name;
                      const providers = markets[j].Providers;
                      for (const p in providers) {
                        // 제공업체 아이디추가;
                        const providersId = providers[p].Id;
                        if (bookmakers.indexOf(providersId) !== -1) {
                          const provider = providers[p];

                          const 마켓이름 = marketName;
                          const 마켓ID = marketId;
                          const 제공업체 = provider;
                          data.marketId = 마켓ID;
                          data.providerId = 제공업체.Id;

                          let gameList: any = await this.cacheService.getKey(
                            `gameList`,
                          );
                          if (!gameList) gameList = [];

                          const game = gameList.find(
                            (e) => e.game_id === 게임ID,
                          );
                          if (마켓이름.indexOf('1X2') !== -1) {
                            for (const b in 제공업체.Bets) {
                              const 배당 = 제공업체.Bets[b];
                              // 리스트에서 Bets가 있을시 정보 변경
                              if (game && game.folders) {
                                const folder = game.folders.find(
                                  (e) =>
                                    e.folders_market === 마켓ID &&
                                    e.folders_bookmaker === 제공업체.Id &&
                                    e.folders_game === 게임ID,
                                );
                                if (folder && folder.bets) {
                                  const bet = folder.bets.find(
                                    (e) => e.bets_id === 배당.Id,
                                  );
                                  bet.bets_price = 배당.Price;
                                  bet.bets_status = 배당.Status;
                                }
                              }

                              const bets = {
                                bets_id: 배당.Id,
                                bets_name: 배당.Name,
                                bets_price: 배당.Price,
                                bets_start_price: 배당.StartPrice,
                                bets_status: 배당.Status,
                              };
                              data.odds.push(bets);
                            }
                          }
                          if (
                            마켓이름.indexOf('12') !== -1 ||
                            마켓이름.indexOf('Winner') !== -1
                          ) {
                            for (const b in 제공업체.Bets) {
                              const 배당 = 제공업체.Bets[b];
                              // 리스트에서 Bets가 있을시 정보 변경
                              if (game && game.folders) {
                                const folder = game.folders.find(
                                  (e) =>
                                    e.folders_market === 마켓ID &&
                                    e.folders_bookmaker === 제공업체.Id &&
                                    e.folders_game === 게임ID,
                                );
                                if (folder && folder.bets) {
                                  const bet = folder.bets.find(
                                    (e) => e.bets_id === 배당.Id,
                                  );
                                  bet.bets_price = 배당.Price;
                                  bet.bets_status = 배당.Status;
                                }
                              }
                              const bets = {
                                bets_id: 배당.Id,
                                bets_name: 배당.Name,
                                bets_price: 배당.Price,
                                bets_start_price: 배당.StartPrice,
                                bets_status: 배당.Status,
                              };
                              data.odds.push(bets);
                            }
                          }
                          if (마켓이름.indexOf('Handicap') !== -1) {
                            let 기준점s = 제공업체.Bets.map((e) => e.BaseLine);
                            기준점s = Array.from(new Set(기준점s));
                            for (const ki in 기준점s) {
                              const 기준점 = 기준점s[ki];
                              if (
                                기준점.indexOf('.25') === -1 &&
                                기준점.indexOf('.75') === -1
                              ) {
                                const 배당 = 제공업체.Bets.filter(
                                  (e) => e.BaseLine === 기준점,
                                );
                                for (const b in 배당) {
                                  const 배당 = 제공업체.Bets[b];
                                  if (game && game.folders) {
                                    const folder = game.folders.find(
                                      (e) =>
                                        e.folders_market === 마켓ID &&
                                        e.folders_bookmaker === 제공업체.Id &&
                                        e.folders_game === 게임ID &&
                                        e.folders_line === 기준점,
                                    );
                                    if (folder && folder.bets) {
                                      const bet = folder.bets.find(
                                        (e) => e.bets_id === 배당.Id,
                                      );
                                      bet.bets_price = 배당.Price;
                                      bet.bets_status = 배당.Status;
                                    }
                                  }
                                  const bets = {
                                    bets_id: 배당.Id,
                                    bets_name: 배당.Name,
                                    bets_price: 배당.Price,
                                    bets_start_price: 배당.StartPrice,
                                    bets_status: 배당.Status,
                                  };
                                  data.odds.push(bets);
                                }
                              }
                            }
                          }
                          if (마켓이름.indexOf('Under/Over') !== -1) {
                            let 기준점s = 제공업체.Bets.map((e) => e.BaseLine);
                            기준점s = Array.from(new Set(기준점s));
                            for (const ki in 기준점s) {
                              const 기준점 = 기준점s[ki];
                              const 배당 = 제공업체.Bets.filter(
                                (e) => e.BaseLine === 기준점,
                              );
                              for (const b in 배당) {
                                const 배당 = 제공업체.Bets[b];
                                if (game && game.folders) {
                                  const folder = game.folders.find(
                                    (e) =>
                                      e.folders_market === 마켓ID &&
                                      e.folders_bookmaker === 제공업체.Id &&
                                      e.folders_game === 게임ID &&
                                      e.folders_line === 기준점,
                                  );
                                  if (folder && folder.bets) {
                                    const bet = folder.bets.find(
                                      (e) => e.bets_id === 배당.Id,
                                    );
                                    bet.bets_price = 배당.Price;
                                    bet.bets_status = 배당.Status;
                                  }
                                }
                                const bets = {
                                  bets_id: 배당.Id,
                                  bets_name: 배당.Name,
                                  bets_price: 배당.Price,
                                  bets_start_price: 배당.StartPrice,
                                  bets_status: 배당.Status,
                                };
                                data.odds.push(bets);
                              }
                            }
                          }
                          await this.cacheService.setKey(`gameList`, gameList);
                        }
                      }
                    }
                  }
                  // console.log(data);
                  this.socket.allUserSend({ name: 'inplay', data });
                }
              }
            }
          },
          {
            noAck: true,
          },
        );
      },
    });
  }

  private close(): void {
    if (this.subscription_channel) {
      this.subscription_channel.close();
    }

    if (this.client_channel) {
      this.client_channel.close();
    }

    if (this.server) {
      this.server.close();
    }

    this.send_response_emmiter.removeAllListeners();

    this.server = null;
    this.subscription_channel = null;
    this.client_channel = null;
    this.connection = null;
  }

  public async send<T>(routing_key: string, message: T) {
    await this.client_channel.publish(
      this.options.exchange.name,
      routing_key,
      Buffer.from(JSON.stringify(message)),
      {
        replyTo: RMQ_REPLY_QUEUE,
        timestamp: new Date().getTime(),
        correlationId: v4(),
      },
    );
  }

  // 경기 상태
  public gameStatus(status) {
    let result = '대기';
    if (status === 1 || status === 9) result = '대기';
    if (status === 2) result = '진행';
    if (status === 3) result = '종료';
    if (status === 4 || status === 6 || status === 7 || status === 8)
      result = '취소';
    if (status === 5) result = '연기';

    return result;
  }
}

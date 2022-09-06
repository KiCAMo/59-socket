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
import { SocketGateway } from '../socket/socket.gateway';

// import { FoldersService } from '../core/folders/folders.service';
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
    private socket: SocketGateway,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async onModuleInit() {
    const url = `https://prematch.lsports.eu/OddService/EnablePackage?username=${appSettings.username}&password=${appSettings.password}&guid=01bb05fb-028a-4e67-830e-16d073902c1d`;
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
          '_4078_',
          async (msg: Message) => {
            const JsonMsg = JSON.parse(msg.content.toString());
            if (JsonMsg.Body) {
              // console.log(JsonMsg);
              const jsonData = JsonMsg.Body;
              if (jsonData.Events) {
                const events = jsonData.Events;
                // 업데이트를 위한 구조화
                // console.log(events);
                const data = {
                  gameId: null,
                  gameStatus: null,
                  marketId: null,
                  bookmakerId: null,
                  score: null,
                  odds: [],
                };
                for (const i in events) {
                  // 픽스쳐 아이디
                  const gameId = events[i].FixtureId;
                  const 게임ID = String(gameId);
                  data.gameId = 게임ID;
                  // 경기상태에대한 정보

                  // 경기 스코어 대한 정보
                  // if (events[i].Livescore) {
                  //   const score: any = {};
                  //   score.period = events[i].Livescore.Scoreboard.CurrentPeriod;
                  //   score.time = events[i].Livescore.Scoreboard.Time;
                  //   // data.score.home =
                  //   const home = events[i].Livescore.Scoreboard.Results.find(
                  //     (e) => e.Position === '1',
                  //   );
                  //   const away = events[i].Livescore.Scoreboard.Results.find(
                  //     (e) => e.Position === '2',
                  //   );
                  //   score.home = home.Value;
                  //   score.away = away.Value;
                  //   data.score = score;
                  //   this.socket.allUserSend({ name: 'score', data });
                  // }

                  const markets = events[i].Markets;
                  const bookmakers = [4, 8, 13, 74, 145];
                  const selectedMarkets = [
                    1, 2, 3, 21, 28, 41, 42, 52, 64, 165, 202, 226, 235, 236,
                    281, 342, 866, 1558,
                  ];
                  if (markets) {
                    for (const j in markets) {
                      // 마켓아이디 추가
                      const marketId = markets[j].Id;
                      const providers = markets[j].Providers;
                      for (const p in providers) {
                        // 제공업체 아이디추가;
                        const providersId = providers[p].Id;
                        if (bookmakers.indexOf(providersId) !== -1) {
                          const provider = providers[p];

                          const 마켓ID = marketId;
                          const 제공업체 = provider;
                          data.marketId = 마켓ID;
                          data.bookmakerId = 제공업체.Id;
                          for (const b in provider.Bets) {
                            const bets = provider.Bets[b];
                            const updated = {
                              bets_id: bets.Id,
                              bets_name: bets.Name,
                              bets_price: bets.Price,
                              bets_status: this.betsStatus(bets.Status),
                              bets_line: bets.BaseLine ? bets.BaseLine : null,
                            };
                            data.odds.push(updated);
                          }
                        }
                      }
                    }
                    if (
                      selectedMarkets.indexOf(data.marketId) !== -1 &&
                      bookmakers.indexOf(data.bookmakerId) !== -1
                    ) {
                      this.socket.allUserSend({ name: 'prematch', data });
                    }
                  }
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

  // 정산 상태
  public betSettlement(settle) {
    let result = 'wait';
    if (settle === -1) result = 'cancelled';
    if (settle === 1) result = 'lose';
    if (settle === 2) result = 'win';
    if (settle === 3) result = 'refund';
    if (settle === 4) result = 'halflose';
    if (settle === 5) result = 'halfwin';
    return result;
  }

  // 벳 상태
  public betsStatus(status) {
    let result = 'wait';
    if (status === 1) result = 'opened';
    if (status === 2) result = 'suspended';
    if (status === 3) result = 'settled';
    return result;
  }
}

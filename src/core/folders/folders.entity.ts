import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BookMakers } from '../bookmakers/bookmakers.entity';
import { Markets } from '../markets/markets.entity';
import { Game } from '../game/game.entity';
import { Bets } from '../bets/bets.entity';

export type YesOrNo = 'y' | 'n';
export type FoldersAttr = '일반' | '공지' | '이벤트' | '보너스' | '빅게임';
export type FoldersResult = 'wait' | 'home' | 'draw' | 'away' | 'exception';
export type FoldersType = '프리매치' | '미니게임' | '라이브' | '로투스';

@Entity()
export class Folders {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  folders_seq: number;

  @Column()
  folders_regstamp: number;

  @Column()
  folders_regdate: Date;

  @Column()
  folders_updatedate: Date;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  folders_is_autoupdate: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['일반', '공지', '이벤트', '보너스', '빅게임'],
    default: '일반',
  })
  folders_attr: FoldersAttr;

  @Column({
    type: 'enum',
    enum: ['프리매치', '스페셜', '인플레이', '미니게임', '라이브', '로투스'],
    default: '프리매치',
  })
  folders_type: string;

  @Column('text')
  folders_return_ratio: string;

  @Column('bigint')
  folders_market: number;

  @OneToOne(() => Markets, (market) => market.markets_id)
  @JoinColumn({
    name: 'folders_market',
    referencedColumnName: 'markets_id',
  })
  markets: Markets;

  @Column('bigint')
  folders_game: number;

  @Column()
  folders_bookmaker: number;

  @OneToOne(() => BookMakers, (bookmaker) => bookmaker.bookmakers_id)
  @JoinColumn({
    name: 'folders_bookmaker',
    referencedColumnName: 'bookmakers_id',
  })
  bookmakers: BookMakers;

  @Column()
  folders_line: string;

  // @Column()
  // folders_home_price: string;
  //
  // @Column()
  // folders_draw_price: string;
  //
  // @Column()
  // folders_away_price: string;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  folders_exception: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['wait', 'home', 'draw', 'away', 'excepted'],
    default: 'wait',
  })
  folders_result: string;

  @Column({ default: 0 })
  folders_betcount: number;

  @Column({ default: 0 })
  folders_betcount_home: number;

  @Column({ default: 0 })
  folders_betcount_draw: number;

  @Column({ default: 0 })
  folders_betcount_away: number;

  @Column({ default: 0 })
  folders_betamount: number;

  @Column({ default: 0 })
  folders_betamount_home: number;

  @Column({ default: 0 })
  folders_betamount_draw: number;

  @Column({ default: 0 })
  folders_betamount_away: number;

  @Column()
  folders_name: string;

  @Column()
  folders_detail: string;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'folders_game', referencedColumnName: 'game_id' })
  game: Game;

  @OneToMany(() => Bets, (betting) => betting.folders)
  bets: Bets[];

  // @Column()
  // folders_result_home: string;
  //
  // @Column()
  // folders_result_away: string;

  // @Column()
  // folders_home_ratio: string;
  //
  // @Column()
  // folders_draw_ratio: string;
  //
  // @Column()
  // folders_away_ratio: string;

  @Column({ default: 1 })
  folders_status: number;

  @Column()
  folders_id: number;

  @Column()
  folders_sites: string;
}

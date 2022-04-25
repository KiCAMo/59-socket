import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Members } from '../members/members.entity';
import { Bets } from '../bets/bets.entity';

export type YesOrNo = 'y' | 'n';
export type BettingStatus = '정상' | '취소';
export type BettingSide = 'home' | 'draw' | 'away';
export type BettingRollingReason = '레벨' | '파트너' | '개인';
export type BettingGameAttr = '일반' | '공지' | '이벤트' | '보너스' | '빅게임';
export type BettingGameStatus = '대기' | '취소' | '연기' | '진행' | '종료';
export type BettingResult = 'wait' | 'hit' | 'exception' | 'miss';
export type BettingTotalResult = 'wait' | 'hit' | 'miss';
export type BettingType =
  | '라이브'
  | '프리매치'
  | '스페셜'
  | '미니게임'
  | '로터스';

@Entity()
export class Betting {
  @PrimaryGeneratedColumn()
  betting_seq: number;

  @Column()
  betting_sitename: string;

  @Column()
  // 베팅된 폴더수
  betting_folders: number;

  @Column()
  betting_regstamp: number;

  @CreateDateColumn()
  betting_regdatetime: Date;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  betting_enabled: YesOrNo;

  @Column()
  betting_betcode: string;

  @Column()
  betting_member: number;

  @Column()
  betting_agent: string;

  @Column({
    type: 'enum',
    enum: ['정상', '취소'],
    default: '정상',
  })
  betting_status: BettingStatus;

  @Column({
    type: 'enum',
    enum: ['home', 'draw', 'away'],
  })
  betting_side: BettingSide;

  @Column()
  betting_bet_amount: number;

  @Column()
  betting_odds: string;

  @Column()
  betting_total_odds: string;

  @Column()
  betting_total_odds_penalty: string;

  @Column()
  betting_total_odds_penalty_reason: string;

  @Column()
  betting_expected_prize: string;

  @Column()
  betting_rolling_amount: string;

  @Column()
  betting_rolling_ratio: string;

  @Column({
    type: 'enum',
    enum: ['레벨', '파트너', '개인'],
  })
  betting_rolling_reason: BettingRollingReason;

  @Column()
  betting_game: number;

  @Column()
  betting_folder: number;

  @Column({
    type: 'enum',
    enum: ['일반', '공지', '이벤트', '보너스', '빅게임'],
    default: '일반',
  })
  betting_game_attr: BettingGameAttr;

  @Column()
  betting_game_sports_name_en: string;

  @Column()
  betting_game_sports_name_kr: string;

  @Column()
  betting_game_sports_icon: string;

  @Column()
  betting_game_markets_name_en: string;

  @Column()
  betting_game_markets_name_kr: string;

  @Column()
  betting_game_markets_icon: string;

  @Column()
  betting_game_leagues_name_en: string;

  @Column()
  betting_game_leagues_name_kr: string;

  @Column()
  betting_game_leagues_icon: string;

  @Column()
  betting_game_home_name_en: string;

  @Column()
  betting_game_home_name_kr: string;

  @Column()
  betting_game_home_icon: string;

  @Column()
  betting_game_away_name_en: string;

  @Column()
  betting_game_away_name_kr: string;

  @Column()
  betting_game_away_icon: string;

  @Column()
  betting_game_starttime: string;

  @Column()
  betting_game_result_home: string;

  @Column()
  betting_game_result_away: string;

  @Column({
    type: 'enum',
    enum: ['라이브', '프리매치', '스페셜', '미니게임', '로터스'],
  })
  betting_type: BettingType;

  @Column({
    type: 'enum',
    enum: ['대기', '취소', '연기', '진행', '종료'],
    default: '대기',
  })
  betting_game_status: BettingGameStatus;

  @Column()
  betting_line: string;

  @Column()
  betting_home_odds: string;

  @Column()
  betting_draw_odds: string;

  @Column()
  betting_away_odds: string;

  @Column({
    type: 'enum',
    enum: ['wait', 'hit', 'exception', 'miss'],
  })
  betting_result: BettingResult;

  @Column({
    type: 'enum',
    enum: ['hit', 'miss', 'wait'],
    default: 'wait',
  })
  betting_total_result: BettingTotalResult;

  @Column()
  betting_total_result_memo: string;

  @Column()
  betting_total_result_stamp: number;

  @Column()
  betting_total_result_datetime: Date;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  betting_auto_exception: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  betting_payed: YesOrNo;

  @Column({ default: 0 })
  betting_payed_amount: number;

  @Column({ default: 0 })
  betting_payed_amount_penalty: number;

  @Column()
  betting_payed_amount_penalty_reason: number;

  @Column({ default: 0 })
  betting_payed_stamp: number;

  @Column({ default: 0 })
  betting_payed_admin: number;

  @Column()
  betting_payed_ip: string;

  @Column({ default: 0 })
  betting_cancel_by: number;

  @Column()
  betting_cancel_stamp: number;

  @Column()
  betting_cancel_ip: string;

  @Column()
  betting_cancel_agent: string;

  @OneToOne(() => Bets)
  @JoinColumn({ name: 'betting_bet', referencedColumnName: 'bets_seq' })
  bet: Bets;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'betting_member',
    referencedColumnName: 'members_seq',
  })
  member: Members;
}

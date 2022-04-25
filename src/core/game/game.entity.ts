import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Sports } from '../sports/sports.entity';
import { Locations } from '../locations/locations.entity';
import { Leagues } from '../leagues/leagues.entity';
import { Teams } from '../teams/teams.entity';
import { Folders } from '../folders/folders.entity';
import { BookMakers } from '../bookmakers/bookmakers.entity';
import { Results } from '../results/results.entity';

export type EventsGameStatus = '대기' | '취소' | '연기' | '진행' | '종료';
export type EventsGameType = '스포츠' | '미니게임' | '로투스' | '카지노';

@Entity()
export class Game {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  game_seq: number;

  @Column()
  game_regstamp: number;

  @Column()
  game_regdate: Date;

  @Column({ type: 'bigint' })
  game_id: number;

  @Column({
    type: 'enum',
    enum: ['대기', '취소', '연기', '진행', '종료'],
    default: '대기',
  })
  game_status: string;

  @Column({
    type: 'enum',
    enum: ['스포츠', '미니게임', '로투스', '카지노'],
    default: '스포츠',
  })
  game_type: string;

  @Column('bigint')
  game_sport: number;

  @Column('bigint')
  game_location: number;

  @Column('bigint')
  game_home_team: number;

  @Column('bigint')
  game_away_team: number;

  @OneToOne(() => Sports, (sport) => sport.sports_id)
  @JoinColumn({ name: 'game_sport', referencedColumnName: 'sports_id' })
  sport: Sports;

  @OneToOne(() => Locations, (location) => location.locations_id)
  @JoinColumn({ name: 'game_location', referencedColumnName: 'locations_id' })
  location: Locations;

  @OneToOne(() => Leagues, (league) => league.leagues_id)
  @JoinColumn({ name: 'game_league', referencedColumnName: 'leagues_id' })
  league: Leagues;

  @OneToOne(() => Teams, (team) => team.teams_id)
  @JoinColumn({ name: 'game_home_team', referencedColumnName: 'teams_id' })
  home_team: Teams;

  @OneToOne(() => Teams, (team) => team.teams_id)
  @JoinColumn({ name: 'game_away_team', referencedColumnName: 'teams_id' })
  away_team: Teams;

  @Column('text')
  game_result_home: string;

  @Column('text')
  game_result_away: string;
  //
  // @Column({
  //   type: 'enum',
  //   enum: ['대기', '완료'],
  //   default: '대기',
  // })
  // game_resulted: string;

  @Column()
  game_name: string;

  @Column()
  game_league: number;

  @Column()
  game_current_period: number;

  @Column()
  game_current_time: number;

  @Column()
  game_round: number;

  @Column()
  game_attr: string;

  @Column()
  game_starttime: Date;

  @Column()
  game_updatedate: Date;

  @OneToMany(() => Folders, (folder) => folder.game)
  folders: Folders[];

  @Column()
  game_default_bookmaker: number;

  @OneToOne(() => BookMakers, (bookmaker) => bookmaker.bookmakers_id)
  @JoinColumn({
    name: 'game_default_bookmaker',
    referencedColumnName: 'bookmakers_id',
  })
  bookmaker: BookMakers;

  @OneToMany(() => Results, (result) => result.game)
  results: Results[];

  // 인플레이 주문상태
  // @Column({
  //   type: 'enum',
  //   enum: ['대기', '완료'],
  //   default: '대기',
  // })
  // game_ordered: string;

  @Column()
  game_sites: string;
}

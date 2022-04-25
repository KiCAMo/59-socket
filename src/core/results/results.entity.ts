import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Game } from '../game/game.entity';

@Entity()
export class Results {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  results_seq: number;

  @Column()
  results_game: number;

  @Column()
  results_period: number;

  @Column()
  results_home: number;

  @Column()
  results_away: number;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  results_is_finished: string;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  results_is_confirmed: string;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'results_game', referencedColumnName: 'game_id' })
  game: Game;
}

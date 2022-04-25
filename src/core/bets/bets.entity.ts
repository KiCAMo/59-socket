import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Folders } from '../folders/folders.entity';

@Entity()
export class Bets {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  bets_seq: number;

  @Column({ type: 'bigint' })
  bets_id: number;

  @Column()
  bets_name: string;

  @Column()
  bets_line: string;

  @Column()
  bets_regstamp: number;

  @Column()
  bets_regdate: Date;

  @Column()
  bets_updatedate: Date;

  @Column()
  bets_status: string;

  @Column()
  bets_price: string;

  @Column()
  bets_start_price: string;

  @Column()
  bets_settlement: string;

  @Column({ type: 'bigint' })
  bets_folder: number;

  @Column()
  bets_ratio: string;

  @ManyToOne(() => Folders)
  @JoinColumn({ name: 'bets_folder', referencedColumnName: 'folders_seq' })
  folders: Folders;
}

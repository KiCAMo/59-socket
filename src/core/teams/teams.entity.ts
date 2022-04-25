import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Teams {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  teams_seq: number;

  @Column()
  teams_id: number;

  @Column('text')
  teams_icon: string;

  @Column('text')
  teams_name_en: string;

  @Column('text')
  teams_name_kr1: string;

  @Column('text')
  teams_name_kr2: string;
}

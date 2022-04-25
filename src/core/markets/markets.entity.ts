import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Markets {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  markets_seq: number;

  @Column()
  markets_id: number;

  @Column('text')
  markets_icon: string;

  @Column('text')
  markets_name_en: string;

  @Column('text')
  markets_name_kr1: string;

  @Column('text')
  markets_name_kr2: string;

  @Column({
    type: 'enum',
    enum: ['사용', '정지'],
    default: '사용',
  })
  markets_status: string;

  @Column()
  markets_min_odds: string;

  @Column()
  markets_max_odds: string;

  @Column({
    type: 'enum',
    enum: ['프리매치', '스페셜', '라이쁘'],
    default: '프리매치',
  })
  markets_type: string;
}

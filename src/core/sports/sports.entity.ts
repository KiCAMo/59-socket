import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sports {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  sports_seq: number;

  @Column()
  sports_id: number;

  @Column('text')
  sports_icon: string;

  @Column('text')
  sports_name_en: string;

  @Column('text')
  sports_name_kr1: string;

  @Column('text')
  sports_name_kr2: string;

  @Column({
    type: 'enum',
    enum: ['사용', '정지'],
    default: '사용',
  })
  sports_status: string;
}

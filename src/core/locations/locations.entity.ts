import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Locations {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  locations_seq: number;

  @Column()
  locations_id: number;

  @Column('text')
  locations_icon: string;

  @Column('text')
  locations_name_en: string;

  @Column('text')
  locations_name_kr1: string;

  @Column('text')
  locations_name_kr2: string;

  @Column({
    type: 'enum',
    enum: ['사용', '정지'],
    default: '사용',
  })
  locations_status: string;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bookmakers' })
export class BookMakers {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  bookmakers_seq: number;

  @Column()
  bookmakers_id: number;

  @Column('text')
  bookmakers_icon: string;

  @Column('text')
  bookmakers_name_en: string;

  @Column('text')
  bookmakers_name_kr1: string;

  @Column('text')
  bookmakers_name_kr2: string;
}

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sports } from '../sports/sports.entity';
import { Locations } from '../locations/locations.entity';

@Entity()
export class Leagues {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  leagues_seq: number;

  @Column()
  leagues_id: number;

  @Column('text')
  leagues_icon: string;

  @Column('text')
  leagues_name_en: string;

  @Column('text')
  leagues_name_kr1: string;

  @Column('text')
  leagues_name_kr2: string;

  @Column({
    type: 'enum',
    enum: ['사용', '정지'],
    default: '사용',
  })
  leagues_status: string;

  // @Column()
  // leagues_img: string;

  @Column()
  leagues_sport: number;

  @Column()
  leagues_location: number;

  @OneToOne(() => Locations, (location) => location.locations_id)
  @JoinColumn({
    name: 'leagues_location',
    referencedColumnName: 'locations_id',
  })
  location: Locations;

  @OneToOne(() => Sports, (sport) => sport.sports_id)
  @JoinColumn({ name: 'leagues_sport', referencedColumnName: 'sports_id' })
  sport: Sports;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// import { Events } from '../events/events.entity';

export type YesOrNo = 'y' | 'n';
export type FoldersAttr = '일반' | '공지' | '이벤트' | '보너스' | '빅게임';
export type FoldersResult = 'wait' | 'home' | 'draw' | 'away';
export type FoldersType = '프리매치' | '미니게임' | '라이브' | '로투스';

@Entity()
export class Sites {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  sites_seq: number;

  @Column()
  sites_name: string;

  @Column({ type: 'json' })
  sites_settings: string;

  @Column()
  sites_member: number;
}

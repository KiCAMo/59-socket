import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Members } from '../members/members.entity';

@Entity('memos')
export class Memos {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  memos_seq: number;

  @Column()
  memos_sitename: string;

  @Column()
  memos_regstamp: number;

  @Column()
  memos_regdatetime: Date;

  @Column('bigint')
  // 작성대상
  memos_member: number;

  @Column('text')
  memos_author_name: string;

  @Column('text')
  memos_subject: string;

  @Column('text')
  memos_content: string;

  @Column()
  // 작성관리자
  memos_author: number;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'memos_member',
    referencedColumnName: 'members_seq',
  })
  member: Members;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'memos_author',
    referencedColumnName: 'members_seq',
  })
  author: Members;
}

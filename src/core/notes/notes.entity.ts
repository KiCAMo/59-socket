import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Members } from '../members/members.entity';

@Entity('notes')
export class Notes {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  notes_seq: number;

  @Column()
  notes_sitename: string;

  @Column()
  notes_regstamp: number;

  @Column()
  notes_regdatetime: Date;

  @Column('bigint')
  notes_author: number;

  @Column('text')
  notes_author_name: string;

  @Column('bigint')
  notes_member: number;

  @Column('text')
  notes_subject: string;

  @Column('text')
  notes_content: string;

  @Column()
  notes_readstamp: number;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'notes_member',
    referencedColumnName: 'members_seq',
  })
  receiver: Members;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'notes_author',
    referencedColumnName: 'members_seq',
  })
  author: Members;
}

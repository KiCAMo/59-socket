import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../board/board.entity';
import { Members } from '../members/members.entity';

@Entity({ name: 'reply' })
export class Reply {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  reply_seq: number;

  @Column()
  reply_regstamp: number;

  @Column()
  reply_regdatetime: Date;

  @Column()
  reply_article: number;

  @Column()
  reply_author: number;

  @Column({ type: 'text' })
  reply_author_name: string;

  @Column()
  reply_author_grade: string;

  @Column({ type: 'text' })
  reply_author_ip: string;

  @Column({ type: 'text' })
  reply_content: string;

  @Column({ type: 'text' })
  reply_author_agent: string;

  @ManyToOne(() => Board)
  @JoinColumn({
    name: 'reply_article',
    referencedColumnName: 'board_seq',
  })
  article: Board;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'reply_author',
    referencedColumnName: 'members_seq',
  })
  author: Members;
}

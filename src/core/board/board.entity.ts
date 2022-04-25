import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Members } from '../members/members.entity';
import { Reply } from '../reply/reply.entity';

export type YesOrNo = 'y' | 'n';
export type BoardStatus = '대기' | '(회)삭제' | '(관)삭제' | '완료';

@Entity({ name: 'board' })
export class Board {
  @PrimaryGeneratedColumn()
  board_seq: number;

  @Column()
  board_sitename: string;

  @Column()
  board_regstamp: number;

  @CreateDateColumn()
  board_regdatetime: Date;

  @Column({
    type: 'enum',
    enum: ['정상', '(회)삭제', '(관)삭제'],
    default: '정상',
  })
  board_status: string;

  @Column()
  board_color: string;

  @Column()
  board_type: string;

  @Column()
  board_title: string;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  board_enabled: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  board_is_notice: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  board_is_highlight: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  board_comment_disabled: YesOrNo;

  @Column()
  board_author: number;

  @Column()
  board_author_name: string;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'board_author',
    referencedColumnName: 'members_seq',
  })
  author: Members;

  @Column()
  board_author_grade: number;

  @Column()
  board_author_ip: string;

  @Column()
  board_author_agent: string;

  @Column()
  board_related_betting: number;

  @Column()
  board_subject: string;

  @Column()
  board_content: string;

  @Column({ default: 0 })
  board_comment_count: number;

  @Column({ default: 0 })
  board_viewcount: number;

  @OneToMany(() => Reply, (comments) => comments.article)
  comments: Reply[];
}

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export type YesOrNo = 'y' | 'n';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  event_seq: number;

  @Column()
  event_sitenames: string;

  @Column()
  event_regstamp: number;

  @CreateDateColumn()
  event_regdatetime: Date;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  event_enabled: YesOrNo;

  @Column()
  event_category: number;

  @Column()
  event_color: number;

  @Column()
  event_author: number;

  @Column()
  event_author_ip: string;

  @Column()
  event_author_agent: string;

  @Column()
  event_subject: string;

  @Column({ default: 0 })
  event_comment_count: number;

  // @Column({ default: 0 })
  // event_viewcount: number;

  @Column()
  event_startdate: Date;

  @Column()
  event_enddate: Date;

  @Column()
  event_image: string;
}

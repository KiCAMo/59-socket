import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Members } from '../members/members.entity';

@Entity('member_logs')
export class MembersLogs {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  member_logs_seq: number;

  @Column('text')
  member_logs_sitename: string;

  @Column()
  member_logs_regstamp: number;

  @Column()
  member_logs_regdatetime: Date;

  @Column('bigint')
  member_logs_member: number;

  @Column('text')
  member_logs_field_name: string;

  @Column('text')
  member_logs_field_value: string;

  @Column('text')
  member_logs_field_old_value: string;

  @Column('bigint')
  member_logs_editor: number;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'member_logs_member',
    referencedColumnName: 'members_seq',
  })
  member: Members;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'member_logs_editor',
    referencedColumnName: 'members_seq',
  })
  admin: Members;
}

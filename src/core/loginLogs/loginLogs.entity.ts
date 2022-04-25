import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Members } from '../members/members.entity';

export type LoginStatus = '성공' | '실패';
export type DeviceType = 'pc' | 'mobile';

@Entity('login_logs')
export class LoginLogs {
  @PrimaryGeneratedColumn()
  login_logs_seq: number;

  @Column()
  login_logs_sitename: string;

  @Column()
  login_logs_regstamp: number;

  @Column()
  login_logs_member: number;

  @Column({
    type: 'enum',
    enum: ['성공', '실패'],
    default: '사용',
  })
  login_logs_type: string;

  @Column()
  login_logs_domain: string;

  @Column({
    type: 'enum',
    enum: ['pc', 'mobile'],
  })
  login_logs_device_type: string;

  @Column()
  login_logs_agent: string;

  @Column()
  login_logs_ip: string;

  @Column()
  login_logs_log: string;

  @ManyToOne(() => Members)
  @JoinColumn({
    name: 'login_logs_member',
    referencedColumnName: 'members_seq',
  })
  logs: Members;
}

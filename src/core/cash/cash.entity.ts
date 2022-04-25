import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Members } from '../members/members.entity';

export type YesOrNo = 'y' | 'n';
export type CashType = '입금' | '출금';
export type CashStatus =
  | '접수'
  | '대기'
  | '(회)접수취소'
  | '(관)접수취소'
  | '처리완료'
  | '처리취소';

@Entity()
export class Cash {
  @PrimaryGeneratedColumn()
  cash_seq: number;

  @Column()
  cash_sitename: string;

  @Column()
  cash_regstamp: number;

  @Column()
  cash_regdatetime: Date;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  cash_enabled: string;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  cash_receive_service: string;

  @Column({
    type: 'enum',
    enum: ['입금', '출금'],
  })
  cash_type: string;

  @Column({
    type: 'enum',
    enum: ['캐시', '베팅', '포인트', '카지노', '당첨', '배당'],
  })
  cash_detail_type: string;

  @Column()
  cash_member: number;

  @Column()
  cash_bankname: string;

  @Column()
  cash_betcode: string;

  @Column()
  cash_account: string;

  @Column()
  cash_ownername: string;

  @Column()
  cash_deposit_name: string;

  @Column()
  cash_ip: string;

  @Column()
  cash_agent: string;

  @Column({
    type: 'enum',
    enum: [
      '접수',
      '대기',
      '(회)접수취소',
      '(관)접수취소',
      '처리완료',
      '처리취소',
    ],
  })
  cash_status: string;

  @Column()
  cash_reason: string;

  @Column()
  cash_amount: number;

  @Column()
  cash_done_by: number;

  @Column()
  cash_done_stamp: number;

  @Column()
  cash_done_datetime: Date;

  @Column()
  cash_done_ip: string;

  @Column()
  cash_done_agent: string;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'cash_member',
    referencedColumnName: 'members_seq',
  })
  member: Members;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'cash_done_by',
    referencedColumnName: 'members_seq',
  })
  admin: Members;
}

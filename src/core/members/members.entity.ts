import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  BeforeUpdate,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { passwordToHash } from '../../common/helpers/password.helper';
import { LoginLogs } from '../loginLogs/loginLogs.entity';
// import { Notes } from '../notes/notes.entity';

export type YesOrNo = 'y' | 'n';
export type MemberStatus = '대기' | '정상' | '차단' | '탈퇴';
export type MemberPasswordHashType =
  | 'plain'
  | 'mysql_password'
  | 'mysql_old_password'
  | 'md5'
  | 'sha1';
export type MemberType =
  | '파트너'
  | '회원'
  | '일반관리자'
  | '최고관리자'
  | '정산제외회원';

export type MemberPartnerType =
  | '사이트'
  | '대본사'
  | '부본사'
  | '총판'
  | '매장'
  | '딜러';

@Entity()
export class Members {
  @PrimaryGeneratedColumn()
  members_seq: number;

  @Column()
  members_sitename: string;

  @Column()
  members_regstamp: number;

  @CreateDateColumn()
  members_regdatetime: Date;

  @Column()
  members_id: string;

  @Column()
  members_passwd: string;

  @Column()
  members_passwd_change_stamp: string;

  @Column()
  members_cashout_passwd: string;

  @Column()
  members_cashout_bankname: string;

  @Column()
  members_cashout_account: string;

  @Column()
  members_cashout_owner: string;

  @Column()
  members_nickname: string;

  @Column()
  members_other_name: string;

  @Column()
  members_phone: string;

  @Column()
  members_grade: number;

  @Column({
    type: 'enum',
    enum: ['파트너', '회원', '일반관리자', '최고관리자', '정산제외회원'],
    default: '회원',
  })
  members_type: string;

  @Column({
    type: 'enum',
    enum: ['사이트', '대본사', '부본사', '총판', '매장', '딜러'],
  })
  members_partner_type: MemberPartnerType;

  @Column()
  members_parent: number;

  @Column()
  members_approved_stamp: string;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  members_is_black: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['신청', '대기', '정상', '차단', '탈퇴'],
    default: '대기',
  })
  members_status: string;

  @Column({
    default: 0,
  })
  members_inactive_stamp: number;

  @Column()
  members_inactive_reason: string;

  @Column({
    default: 0,
  })
  members_quit_stamp: number;

  @Column()
  members_quit_reason: string;

  @Column({
    default: 0,
  })
  members_ban_stamp: number;

  @Column()
  members_ban_reason: string;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  members_can_be_referer: YesOrNo;

  @Column({ type: 'json' })
  // eslint-disable-next-line @typescript-eslint/ban-types
  members_detail_setting: object;

  @Column({ type: 'json' })
  // eslint-disable-next-line @typescript-eslint/ban-types
  members_partner_setting: JSON;

  @Column({ type: 'json' })
  // eslint-disable-next-line @typescript-eslint/ban-types
  members_warn_setting: object;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  members_access_allow_board: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  members_access_allow_cscenter: YesOrNo;

  @Column({
    type: 'enum',
    enum: ['y', 'n'],
    default: 'y',
  })
  members_access_allow_referer: YesOrNo;

  // 멤버회원코드
  @Column()
  members_referer_code: string;

  // 가입아이피
  @Column()
  members_join_ip: string;

  // 가입 에이전트
  @Column()
  members_join_agent: string;

  // 회원가입코드
  @Column()
  members_join_referer_code: string;

  @Column({ default: 0 })
  members_join_referer_seq: number;

  @Column({ default: 0 })
  members_join_referer_origin_seq: number;

  @Column({ default: 0 })
  members_join_referer_count: number;

  @Column()
  members_last_login_ip: string;

  @Column({ default: 0 })
  members_last_login_stamp: number;

  @Column()
  members_last_agent: string;

  @Column()
  members_last_before_login_ip: string;

  @Column()
  members_last_before_login_stamp: string;

  @Column()
  members_last_before_agent: string;

  @Column({ default: 0 })
  members_login_count: number;

  @Column({ default: 0 })
  members_login_ip: string;

  @Column()
  members_recent_betting_date: Date;

  @Column({ default: 0 })
  members_recent_betting_amount: number;

  @Column()
  members_recent_deposit_date: Date;

  @Column({ default: 0 })
  members_recent_deposit_amount: number;

  @Column()
  members_recent_cashout_date: Date;

  @Column({ default: 0 })
  members_recent_cashout_amount: number;

  @Column({ default: 0 })
  members_point: number;

  @Column({ default: 0 })
  members_mileage: number;

  @Column({ default: 0 })
  members_rolling_amount: number;

  @Column({ default: 0 })
  members_coin: number;

  @Column({ default: 0 })
  members_total_deposit_amount: number;

  @Column({ default: 0 })
  members_total_deposit_count: number;

  @Column({ default: 0 })
  members_total_cashout_amount: number;

  @Column({ default: 0 })
  members_total_cashout_count: number;

  @Column({ default: 0 })
  members_total_balance: number;

  @Column({ default: 0 })
  members_total_sports_betting_amount: number;

  @Column({ default: 0 })
  members_total_sports_betting_count: number;

  @Column({ default: 0 })
  members_total_minigame_betting_amount: number;

  @Column({ default: 0 })
  members_total_minigame_betting_count: number;

  @Column({ default: 0 })
  members_total_casino_betting_amount: number;

  @Column({ default: 0 })
  members_total_casino_betting_count: number;

  @Column({ default: 0 })
  members_total_sports_prize_amount: number;

  @Column({ default: 0 })
  members_total_sports_prize_count: number;

  @Column({ default: 0 })
  members_total_minigame_prize_amount: number;

  @Column({ default: 0 })
  members_total_minigame_prize_count: number;

  @Column({ default: 0 })
  members_total_casino_prize_amount: number;

  @Column({ default: 0 })
  members_total_casino_prize_count: number;

  @Column('text')
  members_memo: string;

  @OneToOne(() => Members, (members) => members.members_seq)
  @JoinColumn({
    name: 'members_parent',
    referencedColumnName: 'members_seq',
  })
  parents: Members;

  // 멤머기준으로 받은사람
  // @OneToMany(() => Notes, (note) => note.receiver)
  // notes: Notes[];

  @OneToMany(() => LoginLogs, (log) => log.logs)
  logs: LoginLogs[];

  public jwtPayload() {
    return {
      members_seq: this.members_seq,
      members_id: this.members_id,
      members_type: this.members_type,
      members_grade: this.members_type,
    };
  }

  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    this.members_passwd = passwordToHash(this.members_passwd);
  }
}

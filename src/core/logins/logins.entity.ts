import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Logins {
  // 경기 고유번호
  @PrimaryGeneratedColumn()
  logins_seq: number;

  @Column('text')
  logins_sitename: string;

  @Column()
  logins_regstamp: number;

  @Column('text')
  logins_id: string;

  @Column('text')
  logins_hash: string;

  @Column('text')
  logins_domain: string;

  @Column('text')
  logins_ip: string;

  @Column('text')
  logins_user_agent: string;

  @Column()
  logins_type: string;

  @Column()
  logins_accstamp: number;
}

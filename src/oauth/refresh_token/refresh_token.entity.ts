import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IsString, MinLength } from 'class-validator';

import { generateToken } from '../../common/helpers';
import { EntityHelper } from '../../common/helpers/module/entity.helper';

import { Members } from '../../core/members/members.entity';

@Entity()
export class RefreshToken extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    nullable: false,
  })
  @Index({ unique: true })
  @IsString()
  @MinLength(64)
  public refreshToken: string;

  @Column({
    nullable: false,
  })
  public refreshTokenExpiresAt: Date;

  @Column('text')
  public remoteIp: string;

  @Column('bigint')
  public members_seq: string;
  // @Column('text')
  // public remoteAgent: string;

  @ManyToOne(() => Members, { nullable: false })
  @JoinColumn({ name: 'members_seq' })
  public members: Members;

  @BeforeInsert()
  @BeforeUpdate()
  protected generateAllTokens() {
    this.refreshToken = generateToken();
    this.refreshTokenExpiresAt = new Date(
      new Date().setDate(new Date().getDate() + 7),
    );
  }
}

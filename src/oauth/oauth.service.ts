import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import config from 'config';
import { Algorithm, verify, sign } from 'jsonwebtoken';

import { RefreshToken } from './refresh_token/refresh_token.entity';

import { RefreshTokenService } from './refresh_token/refresh_token.service';
import { MembersService } from '../core/members/members.service';

import { IPayload } from './interface/payload.interface';

import { PasswordDTO } from './dto/password.dto';
import { RefreshDTO } from './dto/refresh.dto';

import {
  refresh_token_expired_signature,
  unauthorized,
} from '../common/errors';
import { checkPassword } from '../common/helpers/password.helper';
import { Members } from '../core/members/members.entity';
import { WsException } from '@nestjs/websockets';
import { LoginLogsService } from '../core/loginLogs/loginLogs.service';

const jwtSettings = config.get<IJwtSettings>('JWT_SETTINGS');

@Injectable()
export class OAuthService {
  constructor(
    private readonly memberService: MembersService,
    private readonly loginLogsService: LoginLogsService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  public async newToken(members: Members, remoteIp) {
    const refreshToken = await this.refreshTokenService.newModel({
      members,
    });

    refreshToken.remoteIp = remoteIp;
    const token = await this.createJWT(refreshToken);
    return { token, members };
  }

  public async signInByPassword(memberCredentials: PasswordDTO) {
    const members = await this.memberService.findOneBy({
      members_id: memberCredentials.members_id,
    });
    if (
      !members ||
      !checkPassword(members.members_passwd, memberCredentials.members_passwd)
    ) {
      throw new WsException('로그인 정보가 없습니다.');
    }

    if (members.members_type.indexOf('관리자') === -1)
      throw new WsException('관리자가 아닙니다.');

    const refreshToken = await this.refreshTokenService.newModel({
      members,
    });

    refreshToken.remoteIp = memberCredentials.remoteIp;
    const token = await this.createJWT(refreshToken);
    return { token, members };
  }

  public async apiSignInByPassword(memberCredentials: PasswordDTO) {
    const members = await this.memberService.findOneBySelect(
      [
        'members_seq',
        'members_nickname',
        'members_point',
        'members_mileage',
        'members_grade',
        'members_passwd',
        'members_login_count',
        'members_login_ip',
        'members_last_login_ip',
      ],
      {
        members_id: memberCredentials.members_id,
      },
      ['notes'],
    );

    if (
      !members ||
      !checkPassword(members.members_passwd, memberCredentials.members_passwd)
    ) {
      unauthorized({ msg: '아이디 패스워드를 확인해주세요' });
    }
    const refreshToken = await this.refreshTokenService.newModel({
      members,
    });
    refreshToken.remoteIp = memberCredentials.remoteIp;
    // 로그 추가
    await this.loginLogsService.create({
      login_logs_device_type: 'pc',
      login_logs_member: members.members_seq,
      login_logs_ip: memberCredentials.remoteIp,
    });
    const token = await this.createJWT(refreshToken);
    delete members.members_passwd;
    delete members.members_cashout_passwd;
    return { token, members };
  }

  public async signInPartnerByPassword(memberCredentials: PasswordDTO) {
    const members = await this.memberService.findOneBy({
      members_id: memberCredentials.members_id,
    });
    if (
      !members ||
      !checkPassword(members.members_passwd, memberCredentials.members_passwd)
    ) {
      throw new WsException('로그인 정보가 없습니다.');
    }

    if (members.members_type.indexOf('파트너') === -1)
      throw new WsException('파트너가 아닙니다.');

    const refreshToken = await this.refreshTokenService.newModel({
      members,
    });

    refreshToken.remoteIp = memberCredentials.remoteIp;
    const token = await this.createJWT(refreshToken);
    return { token, members };
  }

  // public async signInByAuthorizationCode() {
  //   const members = await this.memberService.findAll();
  //
  //   if (!members) {
  //     unauthorized({ raise: true });
  //   }
  //
  //   const refreshToken = await this.refreshTokenService.newModel({ members });
  //
  //   return await this.createJWT(refreshToken);
  // }

  public async signInByRefreshToken(authCredentials: RefreshDTO) {
    const oldRefreshToken = await this.refreshTokenService.findOneBy(
      {
        refreshToken: authCredentials.refreshToken,
      },
      ['members'],
    );

    if (
      !oldRefreshToken ||
      !this.checkExpiresAt(oldRefreshToken.refreshTokenExpiresAt)
    ) {
      refresh_token_expired_signature({ raise: true });
    }

    const refreshToken = await this.refreshTokenService.newModel({
      members: oldRefreshToken.members,
    });

    await this.refreshTokenService.delete(oldRefreshToken.id);

    return await this.createJWT(refreshToken);
  }

  private async createJWT(refreshToken: RefreshToken) {
    const updatedRefreshToken = await this.refreshTokenService.save(
      refreshToken,
    );

    const jwtToken = sign(
      updatedRefreshToken.members.jwtPayload(),
      jwtSettings.secretKey,
      {
        expiresIn: `${jwtSettings.expiresIn}m`,
      },
    );

    return {
      token_type: 'jwt',
      jwt_token: jwtToken,
      expires_in: new Date(
        new Date().setMinutes(new Date().getMinutes() + jwtSettings.expiresIn),
      ).toISOString(),
      refresh_token: updatedRefreshToken.refreshToken,
      refresh_token_expires_at: updatedRefreshToken.refreshTokenExpiresAt,
    };
  }

  private checkExpiresAt(expiresAt: Date) {
    return new Date(expiresAt).toISOString() > new Date().toISOString();
  }

  public verifyToken(token: string) {
    return verify(token, jwtSettings.secretKey, {
      algorithms: jwtSettings.algorithms as Algorithm[],
    }) as IPayload;
  }

  public async getUserFromSocket(socket: Socket) {
    const token = socket.handshake.auth.Authorization
      ? socket.handshake.auth.Authorization
      : null;

    if (!token) return null;
    const result = verify(token, jwtSettings.secretKey, {
      algorithms: jwtSettings.algorithms as Algorithm[],
    }) as IPayload;

    if (!result) return null;
    const member = await this.memberService.findOneBy({
      members_seq: result.members_seq,
    });

    if (!member) return null;
    return member;
  }

  public async getUserFromToken(context) {
    let token = context.headers.authorization;
    if (token.indexOf('Bearer') === -1) token = null;
    token = token.split(' ')[1];
    const result = verify(token, jwtSettings.secretKey, {
      algorithms: jwtSettings.algorithms as Algorithm[],
    }) as IPayload;

    if (!result) return null;
    const member = await this.memberService.findOneBy({
      members_seq: result.members_seq,
    });

    if (!member) return null;
    return member;
  }

  public async validateUser(payload: IPayload) {
    return await this.memberService.findOne(payload.members_id);
  }
}

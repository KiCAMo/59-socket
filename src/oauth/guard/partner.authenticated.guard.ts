import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OAuthService } from '../oauth.service';
import { unauthorized } from '../../common/errors';

@Injectable()
export class JwtPartnerAuthenticatedGuard implements CanActivate {
  constructor(private readonly oauthService: OAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const members = await this.oauthService.getUserFromToken(request);
      if (!members) {
        unauthorized();
      }
      if (members.members_type.indexOf('파트너') === -1) {
        unauthorized({ msg: '파트너 권한이 없습니다' });
      }
      request.user = members;
      request.user.clientIp = request.connection.remoteAddress;
      return Boolean(members);
    } catch (e) {
      console.log('err', e);
      unauthorized();
    }
  }
}

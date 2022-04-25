import { Module } from '@nestjs/common';

// import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';

import { RefreshTokenModule } from './refresh_token/refresh_token.module';
import { MembersModule } from '../core/members/members.module';
import { LoginLogsModule } from '../core/loginLogs/loginLogs.module';

@Module({
  imports: [RefreshTokenModule, MembersModule, LoginLogsModule],
  providers: [OAuthService],
  controllers: [],
  exports: [RefreshTokenModule, OAuthService],
})
export class OAuthModule {}

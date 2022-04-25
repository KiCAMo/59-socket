import { ApiProperty } from '@nestjs/swagger';

import { IsString, MinLength } from 'class-validator';

export class PasswordDTO {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  public readonly members_id: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  public readonly members_passwd: string;

  @IsString()
  public readonly remoteIp: string;
}

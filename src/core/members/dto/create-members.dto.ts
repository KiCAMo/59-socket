import { IsNotEmpty, IsString } from 'class-validator';
import { InputType } from '@nestjs/graphql';

@InputType('membersCreate')
export class CreateMembersDto {
  @IsString()
  @IsNotEmpty()
  members_id: string;
  @IsString()
  @IsNotEmpty()
  members_passwd: string;
  @IsString()
  @IsNotEmpty()
  members_nickname: string;
  @IsString()
  @IsNotEmpty()
  members_cashout_passwd: string;
  @IsString()
  @IsNotEmpty()
  members_cashout_bankname: string;
  @IsString()
  @IsNotEmpty()
  members_cashout_account: string;
  @IsString()
  @IsNotEmpty()
  members_cashout_owner: string;
  @IsString()
  @IsNotEmpty()
  members_phone: string;
  @IsString()
  @IsNotEmpty()
  members_sitename: string;
}

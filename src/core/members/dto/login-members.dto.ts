import { IsNotEmpty } from 'class-validator';

export class LoginMembersDto {
  @IsNotEmpty()
  members_id: string;
  @IsNotEmpty()
  members_passwd: string;
  @IsNotEmpty()
  members_sitename: string;
}

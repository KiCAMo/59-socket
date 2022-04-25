import { IsNotEmpty } from 'class-validator';
import { CashType, CashStatus } from '../cash.entity';

export class CreateCashDto {
  @IsNotEmpty()
  cash_sitename: string;

  cash_status: CashStatus;
  cash_type: CashType;

  @IsNotEmpty()
  cash_bankname: string;

  @IsNotEmpty()
  cash_account: string;
  @IsNotEmpty()
  cash_ownername: string;

  @IsNotEmpty()
  cash_amount: number;

  // cash_reason: string;
  //
  // cash_done_stamp: number;
  // cash_done_by: Members;
  // cash_done_ip: string;
  // cash_done_agent: string;
}

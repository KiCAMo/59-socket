import { Controller, Scope, Post, Body } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
import { MembersService } from '../core/members/members.service';
// import { LotusService } from './token.service';

@Controller({ path: 'token', scope: Scope.REQUEST })
export class CasinoController {
  constructor(
    private memberService: MembersService, // private tokenService: LotusService,
  ) {}

  @Post('balance')
  public async balance(@Body() message: any) {
    const members = await this.memberService.findOneBy({
      members_id: message.user_id,
    });
    // const hash = this.tokenService.generateHash('');
    const response = {
      statauscode: 1,
      cash: 0,
    };
    if (!members) {
      return response;
    }
    response.statauscode = 0;
    response.cash = members.members_point;
    return response;
  }

  @Post('bet')
  public async bet(@Body() message: any) {
    const response = {
      statauscode: 1,
      cash: 0,
    };

    const members = await this.memberService.findOneBy({
      members_id: message.user_id,
    });

    if (message.div === 'bet') {
      // 배팅금액이 보유금과 같거나 작은 경우 (배팅성공)
      if (message.bet.money <= message.start_money) {
        //해당 유저의 Cash 의 금액(배팅금)을 보유머니에서 차감 시키고 StatusCode = 0 과 함께 최종 보유금액을 리턴 {"statuscode" : 0, "cash" : 최종보유금}

        if (message.bet.money > 0) {
          const data = {
            members_point: members.members_point - message.bet.money,
          };
          const result = await this.memberService.update(
            members.members_seq,
            data,
          );
          response.statauscode = 0;
          response.cash = result.members_point;
          return response;
        }
      }

      // 배팅금액이 보유금 보다 큰 경우(배팅실패) StatusCode = 1 과 함께 최종 보유금액을 리턴 {"statuscode" : 1, "cash" : 최종보유금}
      response.cash = members.members_point;
      return response;
    }

    if (message.div === 'cancel') {
      // 배팅 무효처리로 전달된 값을 보유금액에 더하고 StatusCode = 0 과 함께 최종 보유금액을 리턴 {"statuscode" : 0, "cash" : 최종보유금}
      const data = {
        members_point: members.members_point + message.cancel.money,
      };
      const result = await this.memberService.update(members.members_seq, data);
      response.statauscode = 0;
      response.cash = result.members_point;
      return response;
    }

    if (message.div === 'result') {
      // 결과처리 된 값을 유저의 보유금액에 더하고 StatusCode = 0 과 함께 최종 보유금액을 리턴 {"statuscode" : 0, "cash" : 최종보유금}
      const data = {
        members_point: members.members_point + message.result.money,
      };
      const result = await this.memberService.update(members.members_seq, data);
      response.statauscode = 0;
      response.cash = result.members_point;
      return response;
    }
    return response;
  }

  @Post('newbet')
  public async newbet(@Body() message: any) {
    console.log(message.test);
    return { message: 'OK' };
  }
}

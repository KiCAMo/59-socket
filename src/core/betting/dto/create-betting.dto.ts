import { IsNotEmpty } from 'class-validator';
import {
  // BettingGameAttr,
  // BettingGameStatus,
  // BettingRollingReason,
  BettingSide,
  // BettingStatus,
  BettingType,
} from '../betting.entity';
import { Members } from '../../members/members.entity';

export class CreateBettingDto {
  @IsNotEmpty()
  betting_betcode: string;

  @IsNotEmpty()
  betting_member: Members;

  @IsNotEmpty()
  betting_sitename: string;

  // @IsNotEmpty()
  // betting_status: BettingStatus;

  @IsNotEmpty()
  betting_side: BettingSide;

  @IsNotEmpty()
  betting_folders: number;

  @IsNotEmpty()
  betting_bet_amount: number;

  @IsNotEmpty()
  betting_odds: string;

  @IsNotEmpty()
  betting_total_odds: string;

  betting_total_odds_penalty: string;

  betting_total_odds_penalty_reason: string;

  betting_expected_prize: string;

  // 롤링관련 필드
  // betting_rolling_amount: string;
  // betting_rolling_ratio: string;
  // betting_rolling_reason: BettingRollingReason;

  @IsNotEmpty()
  betting_game: number;
  betting_folder: number;

  // @IsNotEmpty()
  // betting_game_attr: BettingGameAttr;

  // betting_game_sports_name_en: string;
  // betting_game_sports_name_kr: string;
  // betting_game_sports_icon: string;
  // betting_game_markets_name_en: string;
  // betting_game_markets_name_kr: string;
  // betting_game_leagues_name_en: string;
  // betting_game_leagues_name_kr: string;
  // betting_game_leagues_icon: string;
  // betting_game_home_name_en: string;
  // betting_game_home_name_kr: string;
  // betting_game_home_icon: string;
  // betting_game_away_name_en: string;
  // betting_game_away_name_kr: string;
  // betting_game_away_icon: string;

  @IsNotEmpty()
  betting_game_starttime: string;
  // betting_game_result_home: string;
  // betting_game_result_away: string;
  // @IsNotEmpty()
  // betting_game_status: BettingGameStatus;
  @IsNotEmpty()
  betting_line: string;
  // @IsNotEmpty()
  // betting_home_odds: string;
  // betting_draw_odds: string;
  // @IsNotEmpty()
  // betting_away_odds: string;
  @IsNotEmpty()
  betting_type: BettingType;
}

import axios from 'axios';
import config from 'config';
import qs from 'qs';

const settings = config.get<ILotusSetting>('LOTUS');

export class LotusService {
  async getToken(userId, game, ip): Promise<any> {
    const url = `${settings.url}`;
    const data = {
      agent: settings.agent,
      apikey: settings.apikey,
      domain: settings.domain,
      user: userId,
      game,
      ip,
    };
    const postData = qs.stringify(data);
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    return await axios.post(url, postData, config);
  }

  // 현재 로투스 남은시간 가져오기
  async getRemainTime() {
    const url = 'http://stream03.lotusgm02.com/baca_result/';
    return await axios.get(url);
  }

  // 현재 로투스 바카라 결과, 다음경기 가져오기
  async getRecentBaccarat() {
    const url = `http://api03.lotusgm01.com/json?key=${settings.apikey}`;
    const result = await axios.get(url);
    return result.data;
  }
}

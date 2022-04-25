import { MD5 } from 'crypto-js';
import axios from 'axios';
import config from 'config';
import qs from 'qs';

const TOKEN_GAME = config.get<ITokenSetting>('TOKEN_GAME');

export class TokenService {
  // constructor() {}
  // 토큰게임에 필요한 유저아이디 해쉬
  generateHash(uid: any) {
    const agentId = TOKEN_GAME.agentId;
    const apiKey = TOKEN_GAME.apiKey;
    let result = `${agentId}|${apiKey}`;
    if (uid !== '') {
      result += `|${uid}`;
    }
    return MD5(result).toString();
  }

  async createUser(userId): Promise<any> {
    const url = `${TOKEN_GAME.url}/auth/`;
    const data = qs.stringify({
      agent_id: TOKEN_GAME.agentId,
      user_id: userId,
      hash: this.generateHash(''),
    });
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    console.log(url, data, config);

    return await axios.post(url, data, config);
  }
}

// import { MD5 } from 'crypto-js';
import axios from 'axios';
import config from 'config';
import qs from 'qs';

const settings = config.get<IMegaCasinoSetting>('MEGA_CASINO');

export class CasinoService {
  async getToken(userId): Promise<any> {
    const data = qs.stringify({
      lang: 'kr',
      operatorId: settings.operatorId,
      thirdPartyCode: '45',
      time: settings.operatorId,
      userID: userId,
      vendorID: '0',
    });
    const url = `${settings.url}/wallet/api/getLobbyUrl?${data}`;
    return await axios.get(url);
  }

  // async createWallet(userId): Promise<any> {
  //             SELECT
  //                 LPAD(IFNULL(MAX(CAST(megaWalletId AS DOUBLE)), 0) + 1, '7', '0') AS megaWalletId
  //             FROM MemberAccount
  // }

  // 메가월렛 지갑 만들고 만들고
  // const data = qs.stringify({
  //   operatorId: setting.operatorId,
  //   time: setting.operatorId,
  //   userID: userId,
  //   vendorID: '0',
  //   walletId
  // });
  ///wallet/list/createAccount?
}

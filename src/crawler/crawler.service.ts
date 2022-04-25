import axios from 'axios';
import moment from 'moment';
const USERNAME = 'betconstructuae@gmail.com';
const PASSWORD = 'AD!1adgf34';
const GUID = '01bb05fb-028a-4e67-830e-16d073902c1d';

export class CrawlerService {
  async reqFixture(fixture = null) {
    let url = `https://prematch.lsports.eu/OddService/GetEvents?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    if (fixture) url += `&fixtures=${fixture}`;
    return await axios.get(url);
  }

  async usedFilterByFolders() {
    const fromDate = moment().unix();
    const toDate = moment().add(1, 'days').unix();
    const url = `https://prematch.lsports.eu/OddService/GetFixtureMarkets?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}&fromdate=${fromDate}&todate=${toDate}&bookmakers=8,74,145&markets=1,2,3,21,28,41,42,52,64,165,202,226,235,236,281,342,866,1558`;
    return await axios.get(url);
  }

  async usedFilterByGames() {
    const fromDate = moment().unix();
    const toDate = moment().add(2, 'days').unix();
    const url = `https://prematch.lsports.eu/OddService/GetFixtures?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}&fromdate=${fromDate}&todate=${toDate}`;
    return await axios.get(url);
  }

  async getIdsByGames(fixtures = null) {
    let url = `https://prematch.lsports.eu/OddService/GetFixtures?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    if (fixtures) url += `&fixtures=${fixtures}`;
    console.log(url);
    return await axios.get(url);
  }

  async getIdsByGame(fixtures = null) {
    let url = `https://prematch.lsports.eu/OddService/GetFixtures?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}&bookmakers=8,74,145&markets=1,2,3,21,28,41,42,52,64,165,202,226,235,236,281,342,866,1558`;
    if (fixtures) url += `&fixtures=${fixtures}`;
    console.log(url);
    return await axios.get(url);
  }

  async getIdsByGameMarket(fixtures = null) {
    let url = `https://prematch.lsports.eu/OddService/GetFixtureMarkets?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}&bookmakers=8,74,145&markets=1,2,3,21,28,41,42,52,64,165,202,226,235,236,281,342,866,1558`;
    if (fixtures) url += `&fixtures=${fixtures}`;
    console.log(url);
    return await axios.get(url);
  }

  async reqFixFolders(fixtures) {
    // const bookmakers = [4, 13, 74];
    // const fromDate = moment().subtract(1, 'days').unix();
    // const toDate = moment().add(3, 'days').unix();
    const url = `https://prematch.lsports.eu/OddService/GetEvents?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}&fixtures=${fixtures}`;
    return await axios.get(url);
  }

  async reqInplayGame() {
    // const bookmakers = [4, 13, 74];
    //const fromDate = moment().unix();
    const fromDate = moment().subtract(5, 'hours').unix();
    const toDate = moment().add(7, 'hours').unix();
    const url = `https://inplay.lsports.eu/api/schedule/GetOrderedFixtures?username=${USERNAME}&password=${PASSWORD}&packageid=4079&fromdate=${fromDate}&todate=${toDate}`;
    return await axios.get(url);
  }

  async reqInplayFolders(snapshotId) {
    // const bookmakers = [4, 13, 74];
    const url = `https://inplay.lsports.eu/api/Snapshot/GetSnapshotJson?username=${USERNAME}&password=${PASSWORD}&packageid=4079&fixtureIds=${snapshotId}`;
    return await axios.get(url);
  }
  async getMarkets() {
    const url = `https://prematch.lsports.eu/OddService/GetMarkets?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    return await axios.get(url);
  }

  async getLeagues() {
    const url = `https://prematch.lsports.eu/OddService/GetLeagues?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    return await axios.get(url);
  }

  async getBookmakers() {
    const url = `https://prematch.lsports.eu/OddService/GetBookmakers?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    return await axios.get(url);
  }

  async getSports() {
    const url = `https://prematch.lsports.eu/OddService/GetSports?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    return await axios.get(url);
  }

  async getLocations() {
    const url = `https://prematch.lsports.eu/OddService/GetLocations?username=${USERNAME}&password=${PASSWORD}&guid=${GUID}`;
    return await axios.get(url);
  }

  async getUrl(url) {
    return await axios.get(url);
  }

  // 경기 상태
  gameStatus(status) {
    let result = '대기';
    if (status === 1 || status === 9) result = '대기';
    if (status === 2) result = '진행';
    if (status === 3) result = '종료';
    if (status === 4 || status === 6 || status === 7 || status === 8)
      result = '취소';
    if (status === 5) result = '연기';

    return result;
  }

  // 정산 상태
  betSettlement(settle) {
    let result = 'wait';
    if (settle === -1) result = 'cancelled';
    if (settle === 1) result = 'lose';
    if (settle === 2) result = 'win';
    if (settle === 3) result = 'refund';
    if (settle === 4) result = 'halflose';
    if (settle === 5) result = 'halfwin';
    return result;
  }

  // 벳 상태
  betsStatus(status) {
    let result = 'opened';
    if (status === 1) result = 'opened';
    if (status === 2) result = 'suspended';
    if (status === 3) result = 'settled';
    return result;
  }
}

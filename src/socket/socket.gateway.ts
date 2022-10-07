import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import config from 'config';
import moment from 'moment';

const appSettings = config.get<IAppSettings>('APP_SETTINGS');

@WebSocketGateway(appSettings.socketPort, {
  transports: ['websocket', 'polling'],
  cors: {
    transports: ['websocket', 'polling'],
    methods: ['GET', 'POST'],
    origin: '*',
    credentials: true,
  },
  allowEIO3: true,
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  clinet = {};
  activeUser = [];

  @WebSocketServer()
  server: Server;
  //소켓 연결시 오브젝트에 저장
  public async handleConnection(client: Socket) {
    this.clinet[client.id] = client;
    this.activeUser.push({ clientId: client.id });
    client.setMaxListeners(0);
  }

  //소켓 연결 해제시 오브젝트에서 제거
  public handleDisconnect(client: Socket): void {
    const index = this.activeUser.findIndex((e) => e.clientId === client.id);
    this.activeUser.splice(index, 1);
  }

  @SubscribeMessage('setUser')
  public setUser(client: Socket, data: any): void {
    const index = this.activeUser.findIndex((e) => e.clientId === client.id);
    try {
      this.activeUser[index].members_nickname = data.user.members_nickname;
      this.activeUser[index].members_id = data.user.members_id;
      this.activeUser[index].members_sitename = data.user.members_sitename;
      this.activeUser[index].members_seq = data.user.members_seq;
      this.activeUser[index].members_cash = data.user.members_cash;
      this.activeUser[index].members_status = data.user.members_status;
      this.activeUser[index].members_type = data.user.members_type;
      this.activeUser[index].id = data.user.id;
      this.activeUser[index].domain = data.user.domain;
      this.activeUser[index].agent = data.user.agent;
      this.activeUser[index].parent = data.user.parent;
      this.activeUser[index].currentMenu = data.user.currentMenu;
      this.activeUser[index].ip = data.user.ip;
      // console.log(this.activeUser);
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('logOutUser')
  public logOutUser(client: Socket, data: any): void {
    console.log(client.id);
    const clientId = data.clientId;
    // console.log(clientId);
    const index = this.activeUser.findIndex((e) => e.clientId === clientId);
    if (index >= 0) this.activeUser.splice(index, 1);
    this.server.to(clientId).emit('logOut');
  }

  @SubscribeMessage('activeUser')
  public connectedUserList(client: Socket): void {
    client.emit('activeUser', JSON.stringify(this.activeUser));
  }

  //소켓 연결 해제시 오브젝트에서 제거
  public allUserSend(obj: any): void {
    obj.timestamp = moment().unix();
    const data = JSON.stringify(obj.data);
    // console.log(data);
    this.server.emit(obj.name, data);
  }

  @SubscribeMessage('sendAllMessage')
  public send(obj: any): void {
    obj.timestamp = moment().unix();
    const data = JSON.stringify(obj.data);
    // console.log(data);
    this.server.emit(obj.name, data);
  }
}

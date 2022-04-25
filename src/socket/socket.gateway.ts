import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
  client: Record<string, Socket>;

  constructor() {
    this.client = {};
  }

  @WebSocketServer()
  server: Server;
  //소켓 연결시 오브젝트에 저장
  public async handleConnection(client: Socket) {
    this.client[client.id] = client;
    client.setMaxListeners(0);
  }

  //소켓 연결 해제시 오브젝트에서 제거
  public handleDisconnect(client: Socket): void {
    console.log('disonnected', client.id);
    delete this.client[client.id];
  }

  //소켓 연결 해제시 오브젝트에서 제거
  public allUserSend(obj: any): void {
    obj.timestamp = moment().unix();
    const data = JSON.stringify(obj.data);
    // console.log(data);
    this.server.emit(obj.name, data);
  }
}

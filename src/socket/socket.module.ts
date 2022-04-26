import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [SocketGateway],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}

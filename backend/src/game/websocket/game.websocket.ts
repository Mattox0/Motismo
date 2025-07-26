import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameService } from "../service/game.service";
import { TranslationService } from "@/translation/translation.service";
import { IWebsocketType } from "../types/IWebsocketType";
import { IAuthenticatedSocket } from "../types/IAuthenticatedSocket";
import { GameUserService } from "@/gameUser/service/gameUser.service";

@WebSocketGateway({ cors: "*", namespace: "room" })
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly gameUserService: GameUserService,
    private readonly translationService: TranslationService,
  ) {}

  @WebSocketServer() server: Server;

  handleConnection(socket: IAuthenticatedSocket): void {
    socket.data.user = {
      userId: socket.handshake.query?.userId as string,
      socketId: socket.id,
      name: socket.handshake.query?.name as string,
      avatar: socket.handshake.query?.avatar as string,
      externalId: socket.handshake.query?.externalId as string,
    };
    socket.data.code = socket.handshake.query.code as string;
    console.log(`New connecting... socket id:`, socket.id);
  }

  handleDisconnect(socket: IAuthenticatedSocket) {
    console.log(`Disconnecting... socket id:`, socket.id);
  }

  @SubscribeMessage(IWebsocketType.JOIN)
  join(@ConnectedSocket() socket: IAuthenticatedSocket) {
    return this.handleAction(socket, async () => {

      const user = await this.gameService.join(socket);

      await socket.join(socket.data.code);

      if (user) {
        console.log(user);
        this.server.to(user.socketId).emit(IWebsocketType.JOIN, user);
        console.log("EMIT")
      }
      await this.emitUpdate(socket);
    });
  }

  @SubscribeMessage(IWebsocketType.START)
  start(@ConnectedSocket() socket: IAuthenticatedSocket) {
    return this.handleAction(socket, async () => {
      await this.gameService.start(socket);
      await this.emitUpdate(socket);
    });
  }

  async emitUpdate(socket: IAuthenticatedSocket) {
    this.server
      .to(socket.data.code)
      .emit(IWebsocketType.MEMBERS, await this.gameUserService.getUsersByCode(socket.data.code));
    this.server.to(socket.data.code).emit(IWebsocketType.IS_STARTED, await this.gameService.isStarted(socket));
  }

  async handleAction(socket: IAuthenticatedSocket, callback: () => unknown): Promise<unknown> {
    try {
      if (await this.gameService.exists(socket.data.code)) {
        return await callback();
      }
      throw new Error(await this.translationService.translate("error.ROOM_UNEXISTS"));
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);

      this.server.to(socket.data.user.socketId).emit(IWebsocketType.ERROR, errorMsg);
    }
  }
}

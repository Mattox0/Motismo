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

function parseMaybeUndefined(val: any) {
  return val === undefined || val === null || val === 'undefined' || val === 'null' ? undefined : val;
}

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
      userId: parseMaybeUndefined(socket.handshake.query?.userId),
      socketId: socket.id,
      name: parseMaybeUndefined(socket.handshake.query?.name),
      avatar: parseMaybeUndefined(socket.handshake.query?.avatar),
      externalId: parseMaybeUndefined(socket.handshake.query?.externalId),
    };
    socket.data.code = parseMaybeUndefined(socket.handshake.query.code);
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
        this.server.to(user.socketId).emit(IWebsocketType.JOIN, user);
      }
      await this.emitUpdate(socket);
      await this.emitQuestionData(socket);
    });
  }

  @SubscribeMessage(IWebsocketType.START)
  start(@ConnectedSocket() socket: IAuthenticatedSocket) {
    return this.handleAction(socket, async () => {
      await this.gameService.start(socket);
      await this.emitUpdate(socket);
      await this.emitQuestionData(socket);
      await this.startQuestionTimer(socket);
    });
  }

  @SubscribeMessage(IWebsocketType.ANSWER)
  answer(@ConnectedSocket() socket: IAuthenticatedSocket, data: { answer: string }) {
    return this.handleAction(socket, async () => {
      // TODO: Implémenter la logique de réponse
      // await this.gameService.submitAnswer(socket, data.answer);
      this.server.to(socket.data.user.socketId).emit(IWebsocketType.ANSWER, { success: true });
    });
  }

  async emitUpdate(socket: IAuthenticatedSocket) {
    this.server
      .to(socket.data.code)
      .emit(IWebsocketType.MEMBERS, await this.gameUserService.getUsersByCode(socket.data.code));
    this.server.to(socket.data.code).emit(IWebsocketType.STATUS, await this.gameService.getStatus(socket));
  }

  async handleAction(socket: IAuthenticatedSocket, callback: () => unknown): Promise<unknown> {
    try {
      if (await this.gameService.exists(socket.data.code)) {
        return await callback();
      }
      throw new Error(await this.translationService.translate("error.ROOM_UNEXISTS"));
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.log(errorMsg);
      this.server.to(socket.data.user.socketId).emit(IWebsocketType.ERROR, errorMsg);
    }
  }

  private async emitQuestionData(socket: IAuthenticatedSocket) {
    const question = await this.gameService.getCurrentQuestion(socket);
    if (question) {
      this.server.to(socket.data.code).emit(IWebsocketType.QUESTION_DATA, question);
    }
  }

  private async startQuestionTimer(socket: IAuthenticatedSocket) {
    const QUESTION_DURATION = 30000; // 30 secondes
    let timeLeft = QUESTION_DURATION;
    
    const timer = setInterval(() => {
      timeLeft -= 1000;
      this.server.to(socket.data.code).emit(IWebsocketType.TIMER, { 
        timeLeft,
        type: 'question' 
      });
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        // Les 30s sont écoulées, l'auteur peut passer à la phase suivante
        this.server.to(socket.data.code).emit(IWebsocketType.TIMER, { 
          timeLeft: 0,
          type: 'question',
          finished: true 
        });
      }
    }, 1000);
  }
}

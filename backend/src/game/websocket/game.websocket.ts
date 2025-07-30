import {
  ConnectedSocket,
  MessageBody,
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
import { IAnswerPayload } from "../types/IAnswerPayload";
import { IGameStatus } from "../types/IGameStatus";

function parseMaybeUndefined(val: any) {
  return val === undefined || val === null || val === 'undefined' || val === 'null' ? undefined : val;
}

@WebSocketGateway({ cors: "*", namespace: "room" })
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

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
      
      const gameStatus = await this.gameService.getStatus(socket);
      if (gameStatus === IGameStatus.DISPLAY_ANSWERS && user) {
        const statistics = await this.gameService.displayAnswers(socket);
        this.server.to(user.socketId).emit(IWebsocketType.RESULTS, statistics);
      } else if (gameStatus === IGameStatus.DISPLAY_RANKING && user) {
        const statistics = await this.gameService.displayRanking(socket);
        this.server.to(user.socketId).emit(IWebsocketType.RANKING, statistics);
      }
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
  answer(@ConnectedSocket() socket: IAuthenticatedSocket, @MessageBody() data: IAnswerPayload) {
    return this.handleAction(socket, async () => {
      const result = await this.gameService.submitAnswer(socket, data);
      this.server.to(socket.data.user.socketId).emit(IWebsocketType.ANSWER, { success: true });
      
      if (result && result.allAnswered) {
        const timer = this.gameTimers.get(socket.data.code);
        if (timer) {
          clearInterval(timer);
          this.gameTimers.delete(socket.data.code);
        }
        
        const answerCount = await this.gameService.getAnswerCount(socket);
        this.server.to(socket.data.code).emit(IWebsocketType.TIMER, { 
          timeLeft: 0,
          type: 'question',
          finished: true,
          allAnswered: true,
          answered: answerCount.answered,
          total: answerCount.total
        });
      }
    });
  }

  @SubscribeMessage(IWebsocketType.DISPLAY_ANSWER)
  displayAnswer(@ConnectedSocket() socket: IAuthenticatedSocket) {
    return this.handleAction(socket, async () => {
      const statistics = await this.gameService.displayAnswers(socket);
      this.server.to(socket.data.code).emit(IWebsocketType.RESULTS, statistics);
      
      await this.emitUpdate(socket);
    });
  }

  @SubscribeMessage(IWebsocketType.DISPLAY_RANKING)
  displayRanking(@ConnectedSocket() socket: IAuthenticatedSocket) {
    return this.handleAction(socket, async () => {
      const statistics = await this.gameService.displayRanking(socket);
      this.server.to(socket.data.code).emit(IWebsocketType.RANKING, statistics);
      
      await this.emitUpdate(socket);
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
    const QUESTION_DURATION = 30000;
    let timeLeft = QUESTION_DURATION;
    
    const existingTimer = this.gameTimers.get(socket.data.code);
    if (existingTimer) {
      clearInterval(existingTimer);
    }
    
    const timer = setInterval(async () => {
      timeLeft -= 1000;
      const answerCount = await this.gameService.getAnswerCount(socket);
      
      this.server.to(socket.data.code).emit(IWebsocketType.TIMER, { 
        timeLeft,
        type: 'question',
        answered: answerCount.answered,
        total: answerCount.total
      });
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.gameTimers.delete(socket.data.code);
        this.server.to(socket.data.code).emit(IWebsocketType.TIMER, { 
          timeLeft: 0,
          type: 'question',
          finished: true,
          answered: answerCount.answered,
          total: answerCount.total
        });
      }
    }, 1000);
    
    this.gameTimers.set(socket.data.code, timer);
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "../game.entity";
import { Repository } from "typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameUser } from "../../gameUser/gameUser.entity";
import { IAuthenticatedSocket } from "../types/IAuthenticatedSocket";
import { GameUserService } from "@/gameUser/service/gameUser.service";
import { ICreateGameUserPayload } from "@/gameUser/types/IGameUserPayload";
import { Quizz } from "@/quizz/quizz.entity";
import crypto from "crypto";
import { User } from "@/user/user.entity";
import { Question } from "@/question/question.entity";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private readonly translationService: TranslationService,
    private readonly gameUserService: GameUserService,
  ) {}

  async create(quizz: Quizz, user: User): Promise<Game> {
    let code = generateCode();

    while (await this.exists(code)) {
      code = generateCode();
    }

    const currentQuestion = quizz.questions?.find((question: Question) => question.order === 1);

    const game = this.gameRepository.create({
      code,
      quizz,
      author: user,
      users: [],
      currentQuestion,
    });

    const savedGame = await this.gameRepository.save(game);

    return savedGame;
  }

  async exists(code: string): Promise<boolean> {
    return await this.gameRepository.exists({ where: { code } });
  }

  async getGame(socket: IAuthenticatedSocket): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { code: socket.data.code },
      relations: {
        users: true,
        currentQuestion: true,
        author: true,
      },
    });

    if (!game) {
      throw new Error(await this.translationService.translate("error.GAME_NOT_FOUND"));
    }

    return game;
  }

  async join(socket: IAuthenticatedSocket): Promise<void> {
    const game = await this.getGame(socket);

    const user: GameUser | undefined = game.users.find((user: GameUser) => user.id === socket.data.user.userId);

    if (user) {
      await this.gameUserService.updateSocketId(socket, game);
    } else {
      const createdUser: ICreateGameUserPayload = {
        game,
        socketId: socket.data.user.socketId,
        name: socket.data.user.name,
        isAuthor: socket.data.user.userId === game.author.id,
      };

      await this.gameUserService.create(createdUser);
    }
  }

  async start(socket: IAuthenticatedSocket): Promise<void> {
    const game = await this.getGame(socket);

    if (socket.data.user.userId !== game.author.id) {
      throw new Error(await this.translationService.translate("error.NOT_AUTHOR"));
    }

    await this.gameRepository
      .createQueryBuilder()
      .update(Game)
      .set({ started: true })
      .where("code = :code", { code: socket.data.code })
      .execute();
  }

  async isStarted(socket: IAuthenticatedSocket): Promise<boolean> {
    const game = await this.getGame(socket);

    return game.started;
  }
}

export const generateCode = (len = 6): string =>
  crypto
    .randomBytes(Math.ceil((len * 3) / 4))
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, len);

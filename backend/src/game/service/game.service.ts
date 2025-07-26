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
import { User } from "@/user/user.entity";
import { Question } from "@/question/question.entity";
import { UserService } from "@/user/service/user.service";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private readonly translationService: TranslationService,
    private readonly gameUserService: GameUserService,
    private readonly userService: UserService,
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

  async join(socket: IAuthenticatedSocket): Promise<GameUser | null> {
    const game = await this.getGame(socket);

    let user: GameUser | undefined = game.users.find((user: GameUser) => user.id === socket.data.user.userId);

    if (user) {
      await this.gameUserService.updateSocketId(socket, game);
    } else {
      const externalUser = await this.userService.findOneUser(socket.data.user.userId);
      const createdUser: ICreateGameUserPayload = {
        game,
        socketId: socket.data.user.socketId,
        name: socket.data.user.name,
        isAuthor: socket.data.user.externalId === game.author.id,
        avatar: socket.data.user.avatar,
        ...(externalUser && { user: externalUser }),
      };

      user = await this.gameUserService.create(createdUser);
    }

    return this.gameUserService.getOneUser(user.id);
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
  Array.from({ length: len }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

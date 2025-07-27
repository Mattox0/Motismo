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
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { UserService } from "@/user/service/user.service";
import { IGameStatus } from "../types/IGameStatus";
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
    const game = await this.gameRepository
      .createQueryBuilder("game")
      .leftJoinAndSelect("game.users", "users")
      .leftJoinAndSelect("users.user", "user")
      .leftJoinAndSelect("users.responses", "responses")
      .leftJoinAndSelect("responses.question", "responseQuestion")
      .leftJoinAndSelect("game.currentQuestion", "currentQuestion")
      .leftJoinAndSelect("currentQuestion.choices", "choices")
      .leftJoinAndSelect("game.author", "author")
      .leftJoinAndSelect("game.quizz", "quizz")
      .leftJoinAndSelect("quizz.questions", "questions")
      .leftJoinAndSelect("questions.choices", "questionChoices")
      .leftJoinAndSelect("quizz.cards", "cards")
      .where("game.code = :code", { code: socket.data.code })
      .orderBy("questions.order", "ASC")
      .addOrderBy("cards.order", "ASC")
      .getOne();

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
      let createdUser: ICreateGameUserPayload = {
        game,
        socketId: socket.data.user.socketId,
        name: socket.data.user.name,
        isAuthor: socket.data.user.externalId === game.author.id,
        avatar: socket.data.user.avatar,
      };
      if (socket.data?.user?.externalId) {
        const externalUser = await this.userService.findOneUser(socket.data.user.externalId);
        if (externalUser) {
          createdUser = { ...createdUser, user: externalUser };
        }
      }
      user = await this.gameUserService.create(createdUser);
    }

    return this.gameUserService.getOneUser(user.id);
  }

  async start(socket: IAuthenticatedSocket): Promise<void> {
    const game = await this.getGame(socket);

    if (socket.data.user.externalId !== game.author.id) {
      throw new Error(await this.translationService.translate("error.NOT_AUTHOR"));
    }

    await this.gameRepository.update({ code: socket.data.code }, { status: IGameStatus.DISPLAY_QUESTION });
  }

  async getCurrentQuestion(socket: IAuthenticatedSocket): Promise<Question | null> {
    const game = await this.getGame(socket);
    
    if (!game.currentQuestion) {
      return null;
    }

    if (game.currentQuestion instanceof ChoiceQuestion) {
      return {
        ...game.currentQuestion,
        choices: game.currentQuestion.choices.map((choice) => ({
          id: choice.id,
          text: choice.text,
        })),
      } as ChoiceQuestion;
    }

    return game.currentQuestion;
  }

  async getStatus(socket: IAuthenticatedSocket): Promise<IGameStatus> {
    const game = await this.getGame(socket);

    return game.status;
  }
}

export const generateCode = (len = 6): string =>
  Array.from({ length: len }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

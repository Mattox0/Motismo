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
import { IAnswerPayload } from "../types/IAnswerPayload";
import { GameResponseService } from "@/gameResponses/services/gameResponse.service";
import { IAnswerStatistics, IChoiceStatistic } from "../types/IAnswerStatistics";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private readonly translationService: TranslationService,
    private readonly gameUserService: GameUserService,
    private readonly userService: UserService,
    private readonly gameResponseService: GameResponseService,
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

    console.log("user", user);

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

  async submitAnswer(socket: IAuthenticatedSocket, data: IAnswerPayload): Promise<{ allAnswered?: boolean } | void> {
    const game = await this.getGame(socket);

    const gameUser = await this.gameUserService.getOneUser(socket.data.user.userId);

    console.log("gameUser answer", gameUser);

    if (!gameUser) {
      throw new Error(await this.translationService.translate("error.USER_NOT_FOUND"));
    }

    if (!game.currentQuestion) {
      throw new Error(await this.translationService.translate("error.NO_CURRENT_QUESTION"));
    }

    // Vérifier si l'utilisateur a déjà répondu
    const hasAnswered = await this.gameResponseService.hasUserAnswered(
      gameUser.id,
      game.currentQuestion.id,
      game.id
    );

    if (hasAnswered) {
      throw new Error(await this.translationService.translate("error.ALREADY_ANSWERED"));
    }

    // Switch selon le type de question
    switch (data.type) {
      case 'MULTIPLE_CHOICES':
        return await this.submitMultipleChoiceAnswer(game, gameUser, data.answer as string[]);
      
      case 'UNIQUE_CHOICES':
        return await this.submitUniqueChoiceAnswer(game, gameUser, data.answer as string);
      
      case 'BOOLEAN_CHOICES':
        return await this.submitBooleanChoiceAnswer(game, gameUser, data.answer as string);
      
      case 'MATCHING':
        return await this.submitMatchingAnswer(game, gameUser, data.answer);
      
      case 'WORD_CLOUD':
        return await this.submitWordCloudAnswer(game, gameUser, data.answer as string);
      
      default:
        throw new Error(await this.translationService.translate("error.INVALID_QUESTION_TYPE"));
    }
  }

  private async submitMultipleChoiceAnswer(game: Game, gameUser: GameUser, answer: string[]): Promise<{ allAnswered?: boolean } | void> {
    if (!game.currentQuestion || !(game.currentQuestion instanceof ChoiceQuestion)) {
      throw new Error(await this.translationService.translate("error.INVALID_QUESTION_TYPE"));
    }

    await this.gameResponseService.createResponse(gameUser, game.currentQuestion, game, answer);

    const correctChoices = game.currentQuestion.choices.filter((choice) => choice.isCorrect);
    const correctChoiceIds = correctChoices.map((choice) => choice.id);

    // Pour les choix multiples : toutes les bonnes réponses doivent être sélectionnées et aucune mauvaise
    const isCorrect = 
      answer.length === correctChoiceIds.length &&
      answer.every((id) => correctChoiceIds.includes(id)) &&
      correctChoiceIds.every((id) => answer.includes(id));

    if (isCorrect) {
      const points = 100;
      await this.gameUserService.addPoints(gameUser.id, points);
    }

    return await this.checkAllPlayersAnswered(game);
  }

  private async submitUniqueChoiceAnswer(game: Game, gameUser: GameUser, answer: string): Promise<{ allAnswered?: boolean } | void> {
    if (!game.currentQuestion || !(game.currentQuestion instanceof ChoiceQuestion)) {
      throw new Error(await this.translationService.translate("error.INVALID_QUESTION_TYPE"));
    }

    await this.gameResponseService.createResponse(gameUser, game.currentQuestion, game, [answer]);

    const correctChoices = game.currentQuestion.choices.filter((choice) => choice.isCorrect);
    const correctChoiceIds = correctChoices.map((choice) => choice.id);

    // Pour les choix uniques : une seule bonne réponse doit être sélectionnée
    const isCorrect = correctChoiceIds.includes(answer);

    if (isCorrect) {
      const points = 100;
      await this.gameUserService.addPoints(gameUser.id, points);
    }

    return await this.checkAllPlayersAnswered(game);
  }

  private async submitBooleanChoiceAnswer(game: Game, gameUser: GameUser, answer: string): Promise<{ allAnswered?: boolean } | void> {
    if (!game.currentQuestion || !(game.currentQuestion instanceof ChoiceQuestion)) {
      throw new Error(await this.translationService.translate("error.INVALID_QUESTION_TYPE"));
    }

    await this.gameResponseService.createResponse(gameUser, game.currentQuestion, game, [answer]);

    const correctChoices = game.currentQuestion.choices.filter((choice) => choice.isCorrect);
    const correctChoiceIds = correctChoices.map((choice) => choice.id);

    // Pour les questions booléennes : une seule bonne réponse (Vrai/Faux)
    const isCorrect = correctChoiceIds.includes(answer);

    if (isCorrect) {
      const points = 100;
      await this.gameUserService.addPoints(gameUser.id, points);
    }

    return await this.checkAllPlayersAnswered(game);
  }

  private async submitMatchingAnswer(game: Game, gameUser: GameUser, answer: any): Promise<{ allAnswered?: boolean } | void> {
    if (!game.currentQuestion) {
      throw new Error(await this.translationService.translate("error.NO_CURRENT_QUESTION"));
    }

    // TODO: Implémenter la logique pour les questions d'association
    await this.gameResponseService.createResponse(gameUser, game.currentQuestion, game, answer);
    
    // Pour l'instant, pas de vérification de correction
    
    return await this.checkAllPlayersAnswered(game);
  }

  private async submitWordCloudAnswer(game: Game, gameUser: GameUser, answer: string): Promise<{ allAnswered?: boolean } | void> {
    if (!game.currentQuestion) {
      throw new Error(await this.translationService.translate("error.NO_CURRENT_QUESTION"));
    }

    // TODO: Implémenter la logique pour les nuages de mots
    await this.gameResponseService.createResponse(gameUser, game.currentQuestion, game, answer);
    
    // Pour l'instant, pas de vérification de correction (pas de bonne/mauvaise réponse)
    
    return await this.checkAllPlayersAnswered(game);
  }

  private async checkAllPlayersAnswered(game: Game): Promise<{ allAnswered?: boolean } | void> {
    if (!game.currentQuestion) {
      throw new Error(await this.translationService.translate("error.NO_CURRENT_QUESTION"));
    }

    const allGameUsers = await this.gameUserService.getGameUsersByGameId(game.id);
    const responses = await this.gameResponseService.getResponsesByQuestionAndGame(game.currentQuestion.id, game.id);
    
    const allPlayersAnswered = allGameUsers.length === responses.length;

    if (allPlayersAnswered) {
      return { allAnswered: true };
    }
  }

  async displayAnswers(socket: IAuthenticatedSocket): Promise<IAnswerStatistics> {
    const game = await this.getGame(socket);

    if (!game.currentQuestion) {
      throw new Error(await this.translationService.translate("error.NO_CURRENT_QUESTION"));
    }

    game.status = IGameStatus.DISPLAY_ANSWERS;
    await this.gameRepository.save(game);

    const responses = await this.gameResponseService.getResponsesByQuestionAndGame(
      game.currentQuestion.id,
      game.id
    );

    console.log("responses", responses);

    if (game.currentQuestion instanceof ChoiceQuestion) {
      const choiceStatistics: IChoiceStatistic[] = [];

      for (const choice of game.currentQuestion.choices) {
        const usersWhoSelectedThis = responses.filter(response => {
          const userAnswers = Array.isArray(response.answer) ? response.answer : [response.answer];
          return userAnswers.includes(choice.id);
        });

        const percentage = responses.length > 0 ? (usersWhoSelectedThis.length / responses.length) * 100 : 0;

        choiceStatistics.push({
          choiceId: choice.id,
          choiceText: choice.text,
          isCorrect: choice.isCorrect,
          count: usersWhoSelectedThis.length,
          percentage: Math.round(percentage * 100) / 100,
          users: usersWhoSelectedThis.map(response => ({
            id: response.user.id,
            name: response.user.name,
            avatar: response.user.avatar,
          })),
        });
      }

      return {
        questionId: game.currentQuestion.id,
        questionTitle: game.currentQuestion.title,
        totalResponses: responses.length,
        choices: choiceStatistics,
      };
    }

    throw new Error(await this.translationService.translate("error.INVALID_QUESTION_TYPE"));
  }

  async getAnswerCount(socket: IAuthenticatedSocket): Promise<{ answered: number; total: number }> {
    const game = await this.getGame(socket);

    if (!game.currentQuestion) {
      return { answered: 0, total: 0 };
    }

    const allGameUsers = await this.gameUserService.getGameUsersByGameId(game.id);
    const responses = await this.gameResponseService.getResponsesByQuestionAndGame(game.currentQuestion.id, game.id);

    return {
      answered: responses.length,
      total: allGameUsers.length
    };
  }
}

export const generateCode = (len = 6): string =>
  Array.from({ length: len }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

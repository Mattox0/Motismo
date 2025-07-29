import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameResponse } from "../gameResponse.entity";
import { GameUser } from "@/gameUser/gameUser.entity";
import { Question } from "@/question/question.entity";
import { Game } from "@/game/game.entity";

@Injectable()
export class GameResponseService {
  constructor(
    @InjectRepository(GameResponse)
    private gameResponseRepository: Repository<GameResponse>,
    private translationService: TranslationService,
  ) {}

  async createResponse(user: GameUser, question: Question, game: Game, answer: string | string[]): Promise<GameResponse> {
    const gameResponse = this.gameResponseRepository.create({
      user,
      question,
      game,
      answer,
    });

    return await this.gameResponseRepository.save(gameResponse);
  }

  async hasUserAnswered(userId: string, questionId: string, gameId: string): Promise<boolean> {
    const response = await this.gameResponseRepository.findOne({
      where: {
        user: { id: userId },
        question: { id: questionId },
        game: { id: gameId },
      },
    });

    return !!response;
  }

  async getResponsesByQuestionAndGame(questionId: string, gameId: string): Promise<GameResponse[]> {
    return await this.gameResponseRepository.find({
      where: {
        question: { id: questionId },
        game: { id: gameId },
      },
      relations: {
        user: true,
      },
    });
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameUser } from "../../gameUser/gameUser.entity";
import { ICreateGameUserPayload } from "../types/IGameUserPayload";
import { IAuthenticatedSocket } from "@/game/types/IAuthenticatedSocket";
import { Game } from "@/game/game.entity";

@Injectable()
export class GameUserService {
  constructor(
    @InjectRepository(GameUser)
    private gameUserRepository: Repository<GameUser>,
    private translationService: TranslationService,
  ) {}

  async getUsersByCode(code: string): Promise<GameUser[]> {
    return await this.gameUserRepository.find({
      where: {
        isAuthor: false,
        game: {
          code: code,
        },
      },
      relations: {
        game: true,
      },
    });
  }

  async getOneUser(id: string): Promise<GameUser | null> {
    return await this.gameUserRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async create(createdUser: ICreateGameUserPayload): Promise<GameUser> {
    const gameUser = this.gameUserRepository.create(createdUser);

    return await this.gameUserRepository.save(gameUser);
  }

  async updateSocketId(socket: IAuthenticatedSocket, game: Game): Promise<void> {
    await this.gameUserRepository
      .createQueryBuilder()
      .update(GameUser)
      .set({ socketId: socket.data.user.socketId })
      .where("id = :id and game.id = :game", { id: socket.data.user.userId, game: game.id })
      .execute();
  }

  async getUserBySocketId(socketId: string): Promise<GameUser | null> {
    return await this.gameUserRepository.findOne({
      where: {
        socketId: socketId,
      },
      relations: {
        game: true,
      },
    });
  }

  async addPoints(userId: string, points: number): Promise<void> {
    await this.gameUserRepository
      .createQueryBuilder()
      .update(GameUser)
      .set({ points: () => `points + ${points}` })
      .where("id = :id", { id: userId })
      .execute();
  }

  async getGameUsersByGameId(gameId: string): Promise<GameUser[]> {
    return await this.gameUserRepository.find({
      where: {
        game: { id: gameId },
        isAuthor: false,
      },
      relations: {
        game: true,
      },
    });
  }
}

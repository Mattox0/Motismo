import { Game } from "@/game/game.entity";

export interface ICreateGameUserPayload {
  name: string;
  socketId: string;
  game: Game;
  isAuthor: boolean;
}

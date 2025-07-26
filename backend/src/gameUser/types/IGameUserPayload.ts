import { Game } from "@/game/game.entity";
import { User } from "@/user/user.entity";

export interface ICreateGameUserPayload {
  name: string;
  socketId: string;
  game: Game;
  isAuthor: boolean;
  avatar: string;
  user?: User;
}

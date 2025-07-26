import { IGame } from './IGame';
import { IUser } from './IUser';

export interface IGameUser {
  id: string;
  name: string;
  socketId: string;
  points: number;
  avatar: string;
  isAuthor: boolean;
  game: IGame;
  user?: IUser;
}

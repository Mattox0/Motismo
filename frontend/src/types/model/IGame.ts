import { IGameUser } from './IGameUser';
import { IQuestion } from './IQuestion';
import { IQuizz } from './IQuizz';
import { IUser } from './IUser';

export interface IGame {
  id: string;
  author: IUser;
  users: IGameUser[];
  code: string;
  started: boolean;
  quizz: IQuizz;
  currentQuestion: IQuestion;
}

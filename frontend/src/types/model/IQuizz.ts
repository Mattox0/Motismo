import { ICard } from './ICard';
import { IQuestion } from './IQuestion';
import { IQuizzType } from './IQuizzType';
import { IUser } from './IUser';

export interface IQuizz {
  id: string;
  title: string;
  image?: string;
  author: IUser;
  quizzType: IQuizzType;
  questions?: IQuestion[];
  cards?: ICard[];
  creationDate: Date;
}

import { Card } from './Card';
import { IQuizzType } from './IQuizzType';
import { Question } from './Question';
import { User } from './User';

export interface Quizz {
  id: string;
  title: string;
  image?: string;
  author: User;
  quizzType: IQuizzType;
  questions?: Question[];
  cards?: Card[];
  creationDate: Date;
}

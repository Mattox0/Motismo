import { IQuestionType } from '../QuestionType';

import { IChoice } from './IChoice';

export interface IQuestion {
  id: string;
  title: string;
  image: string;
  questionType: IQuestionType;
  choices?: IChoice[];
  order: number;
}

import { IChoice } from './IChoice';

export interface IQuestion {
  id: string;
  title: string;
  image: string;
  choices?: IChoice[];
  order: number;
}

import { Choice } from './Choice';

export interface Question {
  id: string;
  title: string;
  image: string;
  choices?: Choice[];
  order: number;
}

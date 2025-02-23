import { Quizz } from "@/quizz/quizz.entity";

export interface IRequestWithQuizz extends Request {
  quizz?: Quizz;
}

import { Quizz } from "@/quizz/quizz.entity";

export interface IRequestWithParamQuizz extends Request {
  params: {
    quizzId: string;
  };
  quizz?: Quizz;
}

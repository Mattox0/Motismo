import { Question } from "@/question/question.entity";

export interface IRequestWithQuestion extends Request {
  question: Question;
}

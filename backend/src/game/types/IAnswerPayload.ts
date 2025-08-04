import { QuestionType } from "@/question/types/questionType";

export interface IAnswerPayload {
  type: QuestionType;
  answer: string | string[];
}

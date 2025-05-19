import { Request } from "express";
import { Question } from "../question.entity";

export interface IRequestWithParamQuestion extends Request {
  params: {
    questionId: string;
  };
  question: Question;
}

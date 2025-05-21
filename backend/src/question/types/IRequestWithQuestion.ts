import { AllQuestion } from "./AllQuestion";

export interface IRequestWithQuestion extends Request {
  question: AllQuestion;
}

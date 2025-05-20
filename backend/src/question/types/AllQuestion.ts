import { ChoiceQuestion } from "../entity/choiceQuestion.entity";
import { MatchingQuestion } from "../entity/matchingQuestion.entity";
import { WordCloudQuestion } from "../entity/wordCloudQuestion.entity";
import { Question } from "../question.entity";

export type AllQuestion =
  | Question
  | ChoiceQuestion
  | MatchingQuestion
  | WordCloudQuestion;

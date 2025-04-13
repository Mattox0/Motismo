import { ChildEntity, Column } from "typeorm";
import { Question } from "../question.entity";

@ChildEntity("MATCHING")
export class MatchingQuestion extends Question {
  @Column({ type: "json" })
  pairs: Array<{
    left: string;
    right: string;
    isCorrect: boolean;
  }>;

  @Column({ type: "boolean", default: false })
  allowPartialMatching: boolean;
}

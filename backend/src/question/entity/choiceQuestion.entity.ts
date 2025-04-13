import { ChildEntity, Column } from "typeorm";
import { Question } from "../question.entity";

@ChildEntity("CHOICE")
export class ChoiceQuestion extends Question {
  @Column({ type: "json" })
  options: Array<{ text: string; isCorrect: boolean }>;

  @Column({ type: "boolean", default: true })
  allowMultipleSelections: boolean;
}

import { ChildEntity, Column, OneToMany } from "typeorm";
import { Question } from "../question.entity";
import { Choice } from "@/choice/choice.entity";

@ChildEntity("CHOICE")
export class ChoiceQuestion extends Question {
  @Column({ type: "boolean", default: true })
  allowMultipleSelections: boolean;

  @OneToMany(() => Choice, (choice) => choice.question, { onDelete: "CASCADE" })
  choices: Choice[];
}

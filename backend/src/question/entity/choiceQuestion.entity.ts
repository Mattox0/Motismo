import { ChildEntity, OneToMany } from "typeorm";
import { Question } from "../question.entity";
import { Choice } from "@/choice/choice.entity";

@ChildEntity("CHOICE")
export class ChoiceQuestion extends Question {
  @OneToMany(() => Choice, (choice) => choice.question, { onDelete: "CASCADE" })
  choices: Choice[];
}

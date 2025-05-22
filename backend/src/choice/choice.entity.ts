import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Choice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  text: string;

  @Column()
  isCorrect: boolean;

  @ManyToOne(() => ChoiceQuestion, (question) => question.choices, {
    onDelete: "CASCADE",
  })
  question: ChoiceQuestion;
}

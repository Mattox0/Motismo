import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Choice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  isCorrect: boolean;

  @ManyToOne(() => ChoiceQuestion, (question) => question.choices)
  question: ChoiceQuestion;
}

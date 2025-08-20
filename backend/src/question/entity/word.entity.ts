import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WordCloudQuestion } from "./wordCloudQuestion.entity";

@Entity()
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => WordCloudQuestion, (question) => question.words, { onDelete: "CASCADE" })
  question: WordCloudQuestion;
}

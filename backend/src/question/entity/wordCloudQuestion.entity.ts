import { ChildEntity, Column, OneToMany } from "typeorm";
import { Question } from "../question.entity";
import { Word } from "./word.entity";

@ChildEntity("WORD_CLOUD")
export class WordCloudQuestion extends Question {
  @OneToMany(() => Word, (word) => word.question, { cascade: true, eager: true })
  words: Word[];

  @Column({ type: "int", default: 5 })
  maxWords: number;
}

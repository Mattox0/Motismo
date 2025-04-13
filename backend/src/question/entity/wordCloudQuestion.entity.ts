import { ChildEntity, Column } from "typeorm";
import { Question } from "../question.entity";

@ChildEntity("WORD_CLOUD")
export class WordCloudQuestion extends Question {
  @Column({ type: "json" })
  words: Array<{ text: string; weight: number }>;

  @Column({ type: "int", default: 10 })
  maxWords: number;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from "typeorm";
import { QuestionType } from "@/question/types/questionType";
import { Quizz } from "@/quizz/quizz.entity";
import { Game } from "@/game/game.entity";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "varchar", nullable: false })
  questionType: QuestionType;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @ManyToOne(() => Quizz, (quizz) => quizz.questions, {
    onDelete: "CASCADE",
  })
  quizz: Quizz;

  @OneToOne(() => Game, (game) => game.currentQuestion)
  game: Game;

  @Column({ type: "int", nullable: false })
  order: number;

  @CreateDateColumn()
  creationDate: Date;
}

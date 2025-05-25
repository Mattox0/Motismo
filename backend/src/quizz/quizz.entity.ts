import { Question } from "@/question/question.entity";
import { User } from "@/user/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IQuizzType } from "./types/IQuizzType";
import { Card } from "@/cards/card.entity";
@Entity()
export class Quizz {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @ManyToOne(() => User, (user) => user.quizz)
  author: User;

  @Column({ type: "enum", enum: IQuizzType, default: IQuizzType.QUESTIONS })
  quizzType: IQuizzType;

  @OneToMany(() => Question, (question) => question.quizz, {
    cascade: ["remove"],
  })
  questions?: Question[];

  @OneToMany(() => Card, (card) => card.quizz, {
    cascade: ["remove"],
  })
  cards?: Card[];

  @CreateDateColumn()
  creationDate: Date;
}

import { Question } from "@/question/question.entity";
import { Quizz } from "@/quizz/quizz.entity";
import { User } from "@/user/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GameUser } from "../gameUser/gameUser.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  code: string;

  @Column({ type: "boolean", default: false })
  started: boolean;

  @ManyToOne(() => Quizz, (quizz) => quizz.games)
  quizz?: Quizz;

  @ManyToOne(() => Question, (question) => question.game)
  currentQuestion?: Question;

  @ManyToOne(() => User, (user) => user.games)
  author: User;

  @OneToMany(() => GameUser, (gameUser) => gameUser.game)
  users: GameUser[];
}

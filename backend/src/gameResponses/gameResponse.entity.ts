import { GameUser } from "@/gameUser/gameUser.entity";
import { Question } from "@/question/question.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameResponse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => GameUser, (gameUser) => gameUser.responses)
  user: GameUser;

  @ManyToOne(() => Question, (question) => question.responses)
  question: Question;

  @CreateDateColumn()
  answeredAt: Date;
}

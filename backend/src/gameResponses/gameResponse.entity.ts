import { GameUser } from "@/gameUser/gameUser.entity";
import { Question } from "@/question/question.entity";
import { Game } from "@/game/game.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameResponse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => GameUser, (gameUser) => gameUser.responses)
  user: GameUser;

  @ManyToOne(() => Question, (question) => question.responses)
  question: Question;

  @ManyToOne(() => Game, (game) => game.responses)
  game: Game;

  @Column({ type: "json" })
  answer: string | string[];

  @CreateDateColumn()
  answeredAt: Date;
}

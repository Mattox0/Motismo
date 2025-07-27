import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "../game/game.entity";
import { User } from "@/user/user.entity";
import { GameResponse } from "@/gameResponses/gameResponse.entity";

@Entity()
export class GameUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  socketId: string;

  @Column({ type: "integer", default: 0 })
  points: number;

  @Column({ type: "varchar", nullable: true })
  avatar: string;

  @Column({ type: "boolean", default: false })
  isAuthor: boolean;

  @ManyToOne(() => User, (user) => user.games)
  user: User;

  @ManyToOne(() => Game, (game) => game.users)
  game: Game;

  @OneToMany(() => GameResponse, (gameResponse) => gameResponse.user)
  responses: GameResponse[];
}

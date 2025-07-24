import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "../game/game.entity";

@Entity()
export class GameUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  socketId: string;

  @Column({ type: "integer", nullable: false })
  points: number;

  @Column({ type: "boolean", default: false })
  isAuthor: boolean;

  @ManyToOne(() => Game, (game) => game.users)
  game: Game;
}

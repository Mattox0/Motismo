import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Role } from "@/user/role.enum";
import { Quizz } from "@/quizz/quizz.entity";
import { Game } from "@/game/game.entity";
import { GameUser } from "@/gameUser/gameUser.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  username: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false, select: false })
  password: string;

  @Column({ type: "varchar", default: Role.Customer })
  role: Role;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @CreateDateColumn()
  creationDate: Date;

  @OneToMany(() => Quizz, (quizz) => quizz.author)
  quizz?: Quizz[];

  @OneToMany(() => Game, (game) => game.author)
  games?: Game[];

  @OneToMany(() => GameUser, (gameUser) => gameUser.user)
  gameUsers?: GameUser[];
}

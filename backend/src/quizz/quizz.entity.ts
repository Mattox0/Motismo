import { User } from "@/user/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

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

  @CreateDateColumn()
  creationDate: Date;
}

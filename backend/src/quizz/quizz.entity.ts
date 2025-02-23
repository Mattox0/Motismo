import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ type: "varchar", nullable: false })
  image?: string;

  @CreateDateColumn()
  creationDate: Date;
}

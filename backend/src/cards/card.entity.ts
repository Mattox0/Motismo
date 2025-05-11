import { Quizz } from "@/quizz/quizz.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: true })
  rectoText: string;

  @Column({ type: "varchar", nullable: true })
  versoText: string;

  @Column({ type: "varchar", nullable: true })
  rectoImage?: string;

  @Column({ type: "varchar", nullable: true })
  versoImage?: string;

  @Column({ type: "integer", nullable: false })
  order: number;

  @ManyToOne(() => Quizz, (quizz) => quizz.cards)
  quizz: Quizz;
}

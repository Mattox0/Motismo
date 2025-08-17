import { User } from "@/user/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Classe {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  code: string;

  @ManyToMany(() => User)
  @JoinTable()
  students: User[];

  @ManyToMany(() => User, (user) => user.teacherClasses)
  teachers: User[];
}

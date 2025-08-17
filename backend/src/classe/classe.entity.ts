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

  @ManyToMany(() => User, (user) => user.studentClasses)
  @JoinTable({
    name: "classe_students",
    joinColumn: {
      name: "classe_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  students: User[];

  @ManyToMany(() => User, (user) => user.teacherClasses)
  @JoinTable({
    name: "classe_teachers",
    joinColumn: {
      name: "classe_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  teachers: User[];
}

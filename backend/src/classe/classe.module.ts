import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Classe } from "@/classe/classe.entity";
import { ClasseController } from "@/classe/controller/classe.controller";
import { ClasseService } from "@/classe/service/classe.service";
import { ClasseGuard } from "@/classe/guards/classe.guard";
import { TeacherClasseGuard } from "@/classe/guards/teacher-classe.guard";
import { TranslationService } from "@/translation/translation.service";
import { User } from "@/user/user.entity";
import { UsersModule } from "@/user/user.module";
import { Quizz } from "@/quizz/quizz.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Classe, User, Quizz]), forwardRef(() => UsersModule)],
  controllers: [ClasseController],
  providers: [ClasseService, ClasseGuard, TeacherClasseGuard, TranslationService],
  exports: [ClasseService],
})
export class ClasseModule {}

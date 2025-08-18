import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { UserController } from "@/user/controller/user.controller";
import { UserService } from "@/user/service/user.service";
import { User } from "@/user/user.entity";
import { StudentAuthGuard } from "@/user/guards/student-auth.guard";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, TranslationService, FileUploadService, StudentAuthGuard],
  exports: [UserService],
})
export class UsersModule {}
